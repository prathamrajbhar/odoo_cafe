import { prisma } from "./lib/db/prisma";

async function promote() {
  await prisma.user.updateMany({
    data: { role: "ADMIN" }
  });
  console.log("All users promoted to ADMIN");
}

promote().catch(console.error).finally(() => prisma.$disconnect());
