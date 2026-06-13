import { PrismaClient, PaymentType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  const methods: PaymentType[] = ["CASH", "CARD", "UPI"];

  for (const type of methods) {
    await prisma.paymentMethod.upsert({
      where: { type },
      update: {},
      create: { type, isActive: false },
    });
  }

  console.log("[seed] payment_methods seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
