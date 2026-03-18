import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      { name: "Monthly", duration: 30, price: 800 },
      { name: "Quarterly", duration: 90, price: 2100 },
      { name: "Half-Yearly", duration: 180, price: 3800 },
      { name: "Annual", duration: 365, price: 6500 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Plans seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
