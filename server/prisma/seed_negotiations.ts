// prisma/seed_negotiations.ts
//
// Insere negociações de seed a partir do CSV em formato LONGO gerado pelo
// script Python (gerar_seed_negociacoes.py).
//
// Para cada negotiation_id do CSV:
//   • a linha kind="negotiation" carrega o created_at, o lead, o atendente,
//     o team_id e o customer_id;
//   • cada linha stage/status/importance vira um registro na tabela de histórico
//     correspondente, com o created_at retroativo do CSV.
//
// Ao final, reconcilia cada lead a partir da sua negociação MAIS RECENTE:
//   • leads.team_id / attendant_id ← negociação mais recente (antes ficavam
//     nulos, o que era incoerente com a negociação). O customer_id NÃO é
//     tocado: todos os leads já o possuem;
//   • leads.status ← último status por created_at (espelha syncLeadStatus).
//
// Uso:
//   tsx prisma/seed_negotiations.ts [caminho/para/o.csv]
//   (sem argumento usa prisma/csv/negotiations_seed_long.csv)
//
// ATENÇÃO: por padrão LIMPA as 4 tabelas de negociação antes de inserir
// (WIPE=true). A tabela leads NÃO é apagada — apenas atualizada. Os
// status/stage/importance são apagados por cascade ao remover as negociações,
// mas removemos explicitamente na ordem inversa de FK para deixar claro.

import "dotenv/config";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient, Prisma } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida no .env!");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const CSV_PATH =
  process.argv[2] ??
  path.resolve(__dirname, "csv", "negotiations_seed_long.csv");

// Limpa as tabelas de negociação antes de inserir (recomendado para seed).
const WIPE = true;

// Timeout generoso para a transação de inserção em lote.
const TX_TIMEOUT_MS = 120_000;

// ─────────────────────────────────────────────
// TIPOS E VALIDAÇÃO DE DOMÍNIO
// ─────────────────────────────────────────────

// Uma linha do CSV longo (todos os campos chegam como string).
interface EventRow {
  negotiation_id: string;
  lead_id: string;
  attendant_id: string;
  team_id: string;
  customer_id: string;
  seq: string;
  kind: string; // negotiation | stage | status | importance
  value: string;
  prev_value: string;
  occurred_at: string;
  notes: string;
}

// FKs "atuais" de um lead, derivadas da sua negociação mais recente.
// (customer_id fica de fora: os leads já o possuem.)
interface LeadAssignment {
  team_id: string;
  attendant_id: string;
  created_at: Date;
}

const VALID_STAGES = new Set<string>([
  "qualificacao",
  "contato_inicial",
  "visita",
  "proposta",
  "negociacao",
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);
const VALID_STATUSES = new Set<string>(["new", "open", "won", "lost"]);
const VALID_IMPORTANCES = new Set<string>(["frio", "morno", "quente"]);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function readCsv(filePath: string): EventRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV não encontrado: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as EventRow[];
}

function parseDate(value: string, ctx: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Data inválida (${ctx}): ${value}`);
  }
  return d;
}

// Agrupa as linhas por negotiation_id, preservando a ordem cronológica.
function groupByNegotiation(rows: EventRow[]): Map<string, EventRow[]> {
  const groups = new Map<string, EventRow[]>();
  for (const r of rows) {
    const list = groups.get(r.negotiation_id) ?? [];
    list.push(r);
    groups.set(r.negotiation_id, list);
  }
  for (const [, list] of groups) {
    list.sort((a, b) => {
      const ta = new Date(a.occurred_at).getTime();
      const tb = new Date(b.occurred_at).getTime();
      if (ta !== tb) return ta - tb;
      return Number(a.seq) - Number(b.seq);
    });
  }
  return groups;
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Inserindo negociações de seed\n");
  console.log(`  CSV: ${CSV_PATH}`);

  const rows = readCsv(CSV_PATH);
  const groups = groupByNegotiation(rows);
  console.log(`  Negociações no CSV: ${groups.size}  (${rows.length} eventos)\n`);

  // 1) Pré-carrega leads, usuários, times e clientes para validar FKs em lote.
  const leadIds = [...new Set(rows.map((r) => r.lead_id))];
  const attendantIds = [...new Set(rows.map((r) => r.attendant_id).filter(Boolean))];
  const teamIds = [...new Set(rows.map((r) => r.team_id).filter(Boolean))];
  const customerIds = [...new Set(rows.map((r) => r.customer_id).filter(Boolean))];

  const leads = await prisma.leads.findMany({
    where: { id: { in: leadIds } },
    select: { id: true, is_active: true },
  });
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  const users = await prisma.users.findMany({
    where: { id: { in: attendantIds } },
    select: { id: true, is_active: true },
  });
  const activeUsers = new Set(users.filter((u) => u.is_active).map((u) => u.id));

  const teams = await prisma.teams.findMany({
    where: { id: { in: teamIds } },
    select: { id: true },
  });
  const existingTeams = new Set(teams.map((t) => t.id));

  const customers = await prisma.customers.findMany({
    where: { id: { in: customerIds } },
    select: { id: true },
  });
  const existingCustomers = new Set(customers.map((c) => c.id));

  // 2) Monta os payloads de createMany, validando cada negociação.
  const negotiationRows: Prisma.NegotiationsCreateManyInput[] = [];
  const statusRows: Prisma.NegotiationStatusCreateManyInput[] = [];
  const stageRows: Prisma.NegotiationStageHistoryCreateManyInput[] = [];
  const importanceRows: Prisma.NegotiationImportanceCreateManyInput[] = [];

  const skipped: { id: string; reason: string }[] = [];
  const okLeadIds = new Set<string>();

  // lead_id → FKs da negociação mais recente daquele lead.
  const leadAssignment = new Map<string, LeadAssignment>();

  for (const [negotiationId, events] of groups) {
    const meta = events.find((e) => e.kind === "negotiation");
    if (!meta) {
      skipped.push({ id: negotiationId, reason: "sem linha kind='negotiation'" });
      continue;
    }

    const lead = leadMap.get(meta.lead_id);
    if (!lead) {
      skipped.push({ id: negotiationId, reason: `lead inexistente (${meta.lead_id})` });
      continue;
    }
    if (!lead.is_active) {
      skipped.push({ id: negotiationId, reason: `lead inativo (${meta.lead_id})` });
      continue;
    }
    if (!meta.team_id || !existingTeams.has(meta.team_id)) {
      skipped.push({
        id: negotiationId,
        reason: `team_id inexistente (${meta.team_id})`,
      });
      continue;
    }
    if (!meta.customer_id || !existingCustomers.has(meta.customer_id)) {
      skipped.push({
        id: negotiationId,
        reason: `customer_id inexistente (${meta.customer_id})`,
      });
      continue;
    }
    if (!meta.attendant_id || !activeUsers.has(meta.attendant_id)) {
      skipped.push({
        id: negotiationId,
        reason: `atendente inexistente/inativo (${meta.attendant_id})`,
      });
      continue;
    }

    const actor = meta.attendant_id;

    // Negociação (created_at retroativo). team_id/customer_id vêm do CSV.
    // FKs escalares: createMany usa o id direto.
    const negCreatedAt = parseDate(meta.occurred_at, `negotiation ${negotiationId}`);

    negotiationRows.push({
      id: negotiationId,
      lead_id: lead.id,
      team_id: meta.team_id,
      customer_id: meta.customer_id,
      attendant_id: meta.attendant_id,
      created_at: negCreatedAt,
      created_by_user_id: actor,
      updated_by_user_id: actor,
    });

    // Atribuição do lead: mantém o team_id/attendant_id da negociação MAIS
    // RECENTE. (mesma ideia do status: o estado "atual" do lead vem do evento
    // mais novo.) O customer_id não entra — os leads já o possuem.
    const prevAssign = leadAssignment.get(lead.id);
    if (!prevAssign || negCreatedAt.getTime() > prevAssign.created_at.getTime()) {
      leadAssignment.set(lead.id, {
        team_id: meta.team_id,
        attendant_id: meta.attendant_id,
        created_at: negCreatedAt,
      });
    }

    // Eventos de histórico.
    for (const ev of events) {
      if (ev.kind === "negotiation") continue;
      const createdAt = parseDate(ev.occurred_at, `${ev.kind} ${negotiationId}`);

      if (ev.kind === "stage") {
        if (!VALID_STAGES.has(ev.value)) {
          throw new Error(`new_stage inválido: ${ev.value} (neg ${negotiationId})`);
        }
        const oldStage = ev.prev_value ? ev.prev_value : null;
        if (oldStage !== null && !VALID_STAGES.has(oldStage)) {
          throw new Error(`old_stage inválido: ${oldStage} (neg ${negotiationId})`);
        }
        stageRows.push({
          id: randomUUID(),
          negotiation_id: negotiationId,
          lead_id: lead.id,
          old_stage: oldStage,
          new_stage: ev.value,
          notes: ev.notes || null,
          created_at: createdAt,
          created_by_user_id: actor,
          updated_by_user_id: actor,
        });
      } else if (ev.kind === "status") {
        if (!VALID_STATUSES.has(ev.value)) {
          throw new Error(`status inválido: ${ev.value} (neg ${negotiationId})`);
        }
        statusRows.push({
          id: randomUUID(),
          negotiation_id: negotiationId,
          lead_id: lead.id,
          status_negotiation: ev.value,
          notes: ev.notes || null,
          created_at: createdAt,
          created_by_user_id: actor,
          updated_by_user_id: actor,
        });
      } else if (ev.kind === "importance") {
        if (!VALID_IMPORTANCES.has(ev.value)) {
          throw new Error(`importância inválida: ${ev.value} (neg ${negotiationId})`);
        }
        importanceRows.push({
          id: randomUUID(),
          negotiation_id: negotiationId,
          lead_id: lead.id,
          importance: ev.value,
          notes: ev.notes || null,
          created_at: createdAt,
          created_by_user_id: actor,
          updated_by_user_id: actor,
        });
      } else {
        throw new Error(`kind desconhecido: ${ev.kind} (neg ${negotiationId})`);
      }
    }

    okLeadIds.add(lead.id);
  }

  console.log(`  Negociações válidas : ${negotiationRows.length}`);
  console.log(
    `  Eventos             : status=${statusRows.length} ` +
      `stage=${stageRows.length} importance=${importanceRows.length}`
  );
  if (skipped.length > 0) {
    console.log(`  ⚠ Ignoradas (${skipped.length}):`);
    const tally = new Map<string, number>();
    for (const s of skipped) {
      const key = s.reason.split(" (")[0] ?? s.reason;
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
    for (const [reason, count] of tally) {
      console.log(`     ${count}× ${reason}`);
    }
  }

  if (negotiationRows.length === 0) {
    throw new Error("Nenhuma negociação válida para inserir. Abortando.");
  }

  // Pré-agrupa os leads pela combinação (team, atendente) para reconciliar as
  // FKs em poucos updateMany. O número de combinações é limitado (≈ nº de
  // atendentes/times), então isso fica barato.
  const leadsByAssignment = new Map<
    string,
    { team_id: string; attendant_id: string; ids: string[] }
  >();
  for (const [leadId, a] of leadAssignment) {
    const key = `${a.team_id}::${a.attendant_id}`;
    let entry = leadsByAssignment.get(key);
    if (!entry) {
      entry = { team_id: a.team_id, attendant_id: a.attendant_id, ids: [] };
      leadsByAssignment.set(key, entry);
    }
    entry.ids.push(leadId);
  }

  // 3) Limpeza + inserção + atribuição das FKs do lead, tudo atômico.
  await prisma.$transaction(
    async (tx) => {
      if (WIPE) {
        // Ordem inversa de FK (status/stage/importance dependem de negotiations).
        await tx.negotiationImportance.deleteMany();
        await tx.negotiationStageHistory.deleteMany();
        await tx.negotiationStatus.deleteMany();
        await tx.negotiations.deleteMany();
      }

      // Negociações primeiro (as histórias referenciam negotiation_id).
      await tx.negotiations.createMany({ data: negotiationRows });
      await tx.negotiationStatus.createMany({ data: statusRows });
      await tx.negotiationStageHistory.createMany({ data: stageRows });
      await tx.negotiationImportance.createMany({ data: importanceRows });

      // O lead deixa de ficar com team_id/attendant_id nulos: recebe as FKs da
      // sua negociação mais recente. (leads NÃO é apagado no WIPE — aqui apenas
      // atualizamos os registros já existentes.)
      for (const { team_id, attendant_id, ids } of leadsByAssignment.values()) {
        await tx.leads.updateMany({
          where: { id: { in: ids } },
          data: { team_id, attendant_id },
        });
      }
    },
    { timeout: TX_TIMEOUT_MS, maxWait: TX_TIMEOUT_MS }
  );

  console.log("\n  ✔ Inserção concluída.");
  console.log(
    `  ✔ lead FKs (team/atendente) reconciliadas para ` +
      `${leadAssignment.size} leads (${leadsByAssignment.size} combinações)`
  );

  // 4) Reconciliação de leads.status = último status por created_at.
  //    Espelha a regra do syncLeadStatus do backend, em lote. Mantida fora da
  //    transação porque relê os status recém-inseridos.
  const leadIdsArr = [...okLeadIds];
  const statuses = await prisma.negotiationStatus.findMany({
    where: { lead_id: { in: leadIdsArr } },
    orderBy: { created_at: "asc" },
    select: { lead_id: true, status_negotiation: true },
  });

  // asc → a última iteração por lead deixa o status mais recente.
  const lastByLead = new Map<string, string>();
  for (const s of statuses) lastByLead.set(s.lead_id, s.status_negotiation);

  // Agrupa os leads pelo status final para atualizar em poucos updateMany.
  const leadsByStatus = new Map<string, string[]>();
  for (const [leadId, st] of lastByLead) {
    const arr = leadsByStatus.get(st) ?? [];
    arr.push(leadId);
    leadsByStatus.set(st, arr);
  }

  for (const [st, ids] of leadsByStatus) {
    await prisma.leads.updateMany({
      where: { id: { in: ids } },
      data: { status: st },
    });
  }

  // Leads sem nenhum status (não deveria ocorrer no seed) → "new".
  const withoutStatus = leadIdsArr.filter((id) => !lastByLead.has(id));
  if (withoutStatus.length > 0) {
    await prisma.leads.updateMany({
      where: { id: { in: withoutStatus } },
      data: { status: "new" },
    });
  }

  console.log(
    `  ✔ lead.status reconciliado para ${leadIdsArr.length} leads ` +
      `(${[...leadsByStatus].map(([k, v]) => `${k}:${v.length}`).join("  ")})`
  );
  console.log("\n✅ Seed de negociações concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed de negociações:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });