import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

async function main() {
  const poolerUrl = "postgresql://neondb_owner:npg_SWpfqr3YTl8m@ep-autumn-salad-atcs1nuu-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log("DATABASE_URL:", poolerUrl);
  console.log("Connecting using pg...");
  const pool = new pg.Pool({ connectionString: poolerUrl });
  const client = await pool.connect();
  console.log("Connected using pg successfully.");
  const res = await client.query("SELECT COUNT(*) FROM kds_ticket_items;");
  console.log("Count from pg:", res.rows[0]);
  client.release();

  console.log("Connecting using Prisma with adapter...");
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  console.log("Attempting query with Prisma...");
  const count = await prisma.kdsTicketItem.count();
  console.log("Count from Prisma:", count);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
