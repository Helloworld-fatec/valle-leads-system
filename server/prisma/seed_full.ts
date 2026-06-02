// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida no .env!");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// CSV row types — todos os campos são string (output do csv-parse)
// ---------------------------------------------------------------------------

interface StoreRow        { id: string; name: string; address: string; is_active: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface TeamRow         { id: string; store_id: string; name: string; is_active: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface UserRow         { id: string; email: string; password_hash: string; name: string; role: string; phone_1_ddd: string; phone_1_number: string; phone_2_ddd: string; phone_2_number: string; address_street: string; address_number: string; address_complement: string; address_neighborhood: string; address_city: string; address_state: string; address_zip: string; is_active: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface UserTeamRow     { id: string; user_id: string; team_id: string; is_active: string; created_at: string; updated_at: string; created_by_user_id: string }
interface CustomerRow     { id: string; name: string; email: string; cpf: string; phone: string; address_street: string; address_number: string; address_complement: string; address_neighborhood: string; address_city: string; address_state: string; address_zip: string; is_active: string; team_id: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface InterestItemRow { id: string; reference_code: string; description: string; value: string; is_active: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface LeadRow         { id: string; source: string; status: string; is_active: string; customer_id: string; team_id: string; attendant_id: string; interest_item_id: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface NegotiationRow  { id: string; team_id: string; lead_id: string; customer_id: string; attendant_id: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface NegStatusRow    { id: string; status_negotiation: string; notes: string; negotiation_id: string; lead_id: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface NegStageRow     { id: string; old_stage: string; new_stage: string; notes: string; negotiation_id: string; lead_id: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }
interface NegImportRow    { id: string; importance: string; notes: string; negotiation_id: string; lead_id: string; created_at: string; updated_at: string; created_by_user_id: string; updated_by_user_id: string }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CSV_DIR = path.resolve(__dirname, "csv");

function readCsv<T>(filename: string): T[] {
  const filePath = path.join(CSV_DIR, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as T[];
}

function toBool(value: string): boolean {
  return value?.toLowerCase() === "true";
}

function toDate(value: string): Date {
  return new Date(value);
}

/** String vazia/ausente → null, caso contrário retorna a string */
function nullable(value: string): string | null {
  return value && value.trim() !== "" ? value.trim() : null;
}

/** String numérica → string com 2 casas decimais, ou null */
function toDecimal(value: string): string | null {
  if (!value || value.trim() === "") return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num.toFixed(2);
}

// ---------------------------------------------------------------------------
// Seed functions — ordem respeita dependências FK
// ---------------------------------------------------------------------------

async function seedStores() {
  const rows = readCsv<StoreRow>("seed_stores.csv");
  console.log(`  → Inserindo ${rows.length} stores...`);

  await prisma.stores.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      name:                r.name,
      address:             nullable(r.address),
      is_active:           toBool(r.is_active),
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedTeams() {
  const rows = readCsv<TeamRow>("seed_teams.csv");
  console.log(`  → Inserindo ${rows.length} teams...`);

  await prisma.teams.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      store_id:            r.store_id,
      name:                r.name,
      is_active:           toBool(r.is_active),
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedUsers() {
  const rows = readCsv<UserRow>("seed_users.csv");
  console.log(`  → Inserindo ${rows.length} users...`);

  await prisma.users.createMany({
    data: rows.map((r) => ({
      id:                    r.id,
      email:                 r.email,
      password_hash:         r.password_hash,
      name:                  r.name,
      role:                  r.role,
      phone_1_ddd:           nullable(r.phone_1_ddd),
      phone_1_number:        nullable(r.phone_1_number),
      phone_2_ddd:           nullable(r.phone_2_ddd),
      phone_2_number:        nullable(r.phone_2_number),
      address_street:        nullable(r.address_street),
      address_number:        nullable(r.address_number),
      address_complement:    nullable(r.address_complement),
      address_neighborhood:  nullable(r.address_neighborhood),
      address_city:          nullable(r.address_city),
      address_state:         nullable(r.address_state),
      address_zip:           nullable(r.address_zip),
      is_active:             toBool(r.is_active),
      created_at:            toDate(r.created_at),
      updated_at:            toDate(r.updated_at),
      created_by_user_id:    nullable(r.created_by_user_id),
      updated_by_user_id:    nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedUserTeams() {
  const rows = readCsv<UserTeamRow>("seed_user_teams.csv");
  console.log(`  → Inserindo ${rows.length} user_teams...`);

  await prisma.userTeams.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      user_id:             r.user_id,
      team_id:             r.team_id,
      is_active:           toBool(r.is_active),
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedCustomers() {
  const rows = readCsv<CustomerRow>("seed_customers.csv");
  console.log(`  → Inserindo ${rows.length} customers...`);

  await prisma.customers.createMany({
    data: rows.map((r) => ({
      id:                    r.id,
      name:                  r.name,
      email:                 nullable(r.email),
      cpf:                   nullable(r.cpf),
      phone:                 r.phone,
      address_street:        nullable(r.address_street),
      address_number:        nullable(r.address_number),
      address_complement:    nullable(r.address_complement),
      address_neighborhood:  nullable(r.address_neighborhood),
      address_city:          nullable(r.address_city),
      address_state:         nullable(r.address_state),
      address_zip:           nullable(r.address_zip),
      is_active:             toBool(r.is_active),
      team_id:               nullable(r.team_id),
      created_at:            toDate(r.created_at),
      updated_at:            toDate(r.updated_at),
      created_by_user_id:    nullable(r.created_by_user_id),
      updated_by_user_id:    nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedInterestItems() {
  const rows = readCsv<InterestItemRow>("seed_interest_items.csv");
  console.log(`  → Inserindo ${rows.length} interest_items...`);

  await prisma.interestItems.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      reference_code:      nullable(r.reference_code),
      description:         r.description,
      value:               toDecimal(r.value),
      is_active:           toBool(r.is_active),
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedLeads() {
  const rows = readCsv<LeadRow>("seed_leads.csv");
  console.log(`  → Inserindo ${rows.length} leads...`);

  await prisma.leads.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      source:              nullable(r.source),
      status:              r.status,
      is_active:           toBool(r.is_active),
      customer_id:         r.customer_id,
      team_id:             r.team_id,
      attendant_id:        nullable(r.attendant_id),
      interest_item_id:    nullable(r.interest_item_id),
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedNegotiations() {
  const rows = readCsv<NegotiationRow>("seed_negotiations.csv");
  console.log(`  → Inserindo ${rows.length} negotiations...`);

  await prisma.negotiations.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      team_id:             r.team_id,
      lead_id:             r.lead_id,
      customer_id:         r.customer_id,
      attendant_id:        nullable(r.attendant_id),
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedNegotiationStatus() {
  const rows = readCsv<NegStatusRow>("seed_negotiation_status.csv");
  console.log(`  → Inserindo ${rows.length} negotiation_status_history...`);

  await prisma.negotiationStatus.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      status_negotiation:  r.status_negotiation,
      notes:               nullable(r.notes),
      negotiation_id:      r.negotiation_id,
      lead_id:             r.lead_id,
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedNegotiationStageHistory() {
  const rows = readCsv<NegStageRow>("seed_negotiation_stage.csv");
  console.log(`  → Inserindo ${rows.length} negotiation_stage_history...`);

  await prisma.negotiationStageHistory.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      old_stage:           nullable(r.old_stage),
      new_stage:           r.new_stage,
      notes:               nullable(r.notes),
      negotiation_id:      r.negotiation_id,
      lead_id:             r.lead_id,
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

async function seedNegotiationImportance() {
  const rows = readCsv<NegImportRow>("seed_negotiation_importance.csv");
  console.log(`  → Inserindo ${rows.length} negotiation_importance_history...`);

  await prisma.negotiationImportance.createMany({
    data: rows.map((r) => ({
      id:                  r.id,
      importance:          r.importance,
      notes:               nullable(r.notes),
      negotiation_id:      r.negotiation_id,
      lead_id:             r.lead_id,
      created_at:          toDate(r.created_at),
      updated_at:          toDate(r.updated_at),
      created_by_user_id:  nullable(r.created_by_user_id),
      updated_by_user_id:  nullable(r.updated_by_user_id),
    })),
    skipDuplicates: true,
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // Ordem obrigatória respeitando as FKs:
  // stores → teams → users → user_teams
  //       → customers → interest_items → leads
  //                                    → negotiations → históricos

  await seedStores();
  await seedTeams();
  await seedUsers();
  await seedUserTeams();
  await seedCustomers();
  await seedInterestItems();
  await seedLeads();
  await seedNegotiations();
  await seedNegotiationStatus();
  await seedNegotiationStageHistory();
  await seedNegotiationImportance();

  console.log("\n✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });