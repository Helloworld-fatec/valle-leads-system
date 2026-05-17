import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvPath = path.resolve("prisma", "seed_data.csv");

// Inicializa o Prisma com adapter pg (igual ao prisma.ts do projeto)
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não definida!");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CsvRow {
  lead_id: string;
  team_name: string;
  user_name: string;
  user_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  source: string;
  subject: string;
  lead_created_at: string;
  first_interaction_at: string;
  negotiation_importance: string;
  negotiation_stage: string;
  negotiation_status: string;
  is_open: string;
  negotiation_created_at: string;
  negotiation_updated_at: string;
  finalization_reason: string;
}

function mapLeadStatus(negotiationStatus: string): string {
  switch (negotiationStatus) {
    case "Aberto":           return "OPEN";
    case "Em negociação":    return "IN_PROGRESS";
    case "Finalizado com venda":  return "CLOSED_WON";
    case "Finalizado sem venda":  return "CLOSED_LOST";
    default:                 return "OPEN";
  }
}

function toDate(value: string): Date {
  return new Date(value);
}

function orNull(value: string): string | null {
  return value?.trim() ? value.trim() : null;
}

async function main() {
  console.log("🌱 Iniciando seed...\n");

  const csvPath = path.resolve(__dirname, "seed_data.csv");
  const fileContent = fs.readFileSync(csvPath, { encoding: "utf-8" });
  const rows: CsvRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  console.log(`📄 ${rows.length} registros encontrados no CSV\n`);

  // 1. Stores
  console.log("🏪 Criando lojas...");

  const storesData = [
    { key: "SJC",      name: "1000 Valle Multimarcas - São José dos Campos", address: "Av. Cassiopeia, 295 - Jardim Satélite, São José dos Campos - SP, 12230-010" },
    { key: "Caçapava", name: "1000 Valle Multimarcas - Caçapava",            address: "R. Prof. Edmir Viana de Moura, 68 - Vera Cruz, Caçapava - SP, 12286-710" },
    { key: "PA",       name: "1000 Valle Multimarcas - Pouso Alegre",        address: "Av. Pinto Cobra, 840 - Santa Cecilia, Pouso Alegre - MG, 37554-142" },
    { key: "Serramar", name: "1000 Valle Multimarcas Serramar Shopping",     address: "Av. José Herculano, 1086 - LOJA AB 02C - Pontal de Santa Marina, Caraguatatuba - SP, 11672-390" },
  ];

  const storeMap = new Map<string, string>();

  for (const s of storesData) {
    let store = await prisma.stores.findFirst({ where: { name: s.name } });
    if (!store) {
      store = await prisma.stores.create({ data: { name: s.name, address: s.address } });
    }
    storeMap.set(s.key, store.id);
    console.log(`  ✓ ${s.name}`);
  }

  // 2. Teams
  console.log("\n👥 Criando equipes...");

  const teamToStoreKey: Record<string, string> = {
    "Equipe SJC":      "SJC",
    "Equipe Caçapava": "Caçapava",
    "Equipe PA":       "PA",
  };

  const uniqueTeamNames = [...new Set(rows.map((r) => r.team_name))];
  const teamMap = new Map<string, string>();

  for (const teamName of uniqueTeamNames) {
    const storeKey = teamToStoreKey[teamName];
    if (!storeKey) { console.warn(`  ⚠ Equipe sem loja mapeada: ${teamName}`); continue; }
    const storeId = storeMap.get(storeKey)!;
    let team = await prisma.teams.findFirst({ where: { name: teamName, store_id: storeId } });
    if (!team) {
      team = await prisma.teams.create({ data: { store_id: storeId, name: teamName, is_active: true } });
    }
    teamMap.set(teamName, team.id);
    console.log(`  ✓ ${teamName} → ${storeKey}`);
  }

  // 3. Users
  console.log("\n👤 Criando usuários...");

  const PASSWORD_HASH = "$2a$12$23AXi2.U3ATOdWi7LzW8B.KWlxvGb3a8K9bUy5O4NFel2Sgd5iILG";

  const uniqueUsers = new Map<string, { name: string; email: string; teamName: string }>();
  for (const r of rows) {
    if (!uniqueUsers.has(r.user_email)) {
      uniqueUsers.set(r.user_email, { name: r.user_name, email: r.user_email, teamName: r.team_name });
    }
  }

  const userMap = new Map<string, string>();

  for (const [email, u] of uniqueUsers) {
    const user = await prisma.users.upsert({
      where: { email },
      update: {},
      create: { email, name: u.name, password_hash: PASSWORD_HASH, role: "ATTENDANT", is_active: true },
    });
    userMap.set(email, user.id);
    console.log(`  ✓ ${u.name} (${email})`);
  }

  // 4. UserTeams
  console.log("\n🔗 Vinculando usuários às equipes...");

  for (const [email, u] of uniqueUsers) {
    const userId = userMap.get(email)!;
    const teamId = teamMap.get(u.teamName);
    if (!teamId) continue;
    await prisma.userTeams.upsert({
      where: { user_id_team_id: { user_id: userId, team_id: teamId } },
      update: {},
      create: { user_id: userId, team_id: teamId },
    });
    console.log(`  ✓ ${u.name} → ${u.teamName}`);
  }

  // 5. Customers
  console.log("\n🧑 Criando clientes...");

  const uniqueCustomers = new Map<string, { name: string; email: string; phone: string; cpf: string; teamName: string }>();
  for (const r of rows) {
    if (!uniqueCustomers.has(r.customer_cpf)) {
      uniqueCustomers.set(r.customer_cpf, {
        name: r.customer_name, email: r.customer_email,
        phone: r.customer_phone, cpf: r.customer_cpf, teamName: r.team_name,
      });
    }
  }

  const customerMap = new Map<string, string>();

  for (const [cpf, c] of uniqueCustomers) {
    const teamId = teamMap.get(c.teamName) ?? null;
    const customer = await prisma.customers.upsert({
      where: { cpf },
      update: {},
      create: { name: c.name, email: orNull(c.email), cpf, phone: orNull(c.phone), is_active: true, team_id: teamId },
    });
    customerMap.set(cpf, customer.id);
  }

  console.log(`  ✓ ${uniqueCustomers.size} clientes criados`);

  // 6. Leads + Negotiations + históricos
  console.log("\n📋 Criando leads e negociações...");

  let leadsCount = 0;
  let negotiationsCount = 0;

  for (const r of rows) {
    const teamId     = teamMap.get(r.team_name);
    const customerId = customerMap.get(r.customer_cpf);
    const attendantId = userMap.get(r.user_email) ?? null;

    if (!teamId || !customerId) {
      console.warn(`  ⚠ Lead ${r.lead_id} ignorado — team ou customer não encontrado`);
      continue;
    }

    const leadCreatedAt        = toDate(r.lead_created_at);
    const firstInteractionAt   = toDate(r.first_interaction_at);
    const negotiationUpdatedAt = toDate(r.negotiation_updated_at);

    const lead = await prisma.leads.create({
      data: {
        source: orNull(r.source),
        status: mapLeadStatus(r.negotiation_status),
        is_active: r.is_open === "TRUE",
        vehicle_interest: orNull(r.subject),
        customer_id: customerId,
        team_id: teamId,
        attendant_id: attendantId,
        created_at: leadCreatedAt,
        updated_at: negotiationUpdatedAt,
      },
    });
    leadsCount++;

    const negotiation = await prisma.negotiations.create({
      data: {
        team_id: teamId,
        lead_id: lead.id,
        created_at: firstInteractionAt,
        updated_at: negotiationUpdatedAt,
      },
    });
    negotiationsCount++;

    await prisma.negotiationStatus.create({
      data: {
        negotiation_id: negotiation.id,
        status_negotiation: r.negotiation_status,
        notes: orNull(r.finalization_reason),
        created_at: firstInteractionAt,
        updated_at: negotiationUpdatedAt,
      },
    });

    await prisma.negotiationStageHistory.create({
      data: {
        negotiation_id: negotiation.id,
        old_status: null,
        new_status: r.negotiation_stage,
        created_at: firstInteractionAt,
        updated_at: negotiationUpdatedAt,
      },
    });

    await prisma.negotiationImportance.create({
      data: {
        negotiation_id: negotiation.id,
        importance: r.negotiation_importance,
        created_at: firstInteractionAt,
        updated_at: negotiationUpdatedAt,
      },
    });
  }

  console.log(`  ✓ ${leadsCount} leads criados`);
  console.log(`  ✓ ${negotiationsCount} negociações criadas`);
  console.log("\n✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => { console.error("❌ Erro no seed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });