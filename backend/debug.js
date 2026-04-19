const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const allDogs = await prisma.dog.findMany();
  console.log("ALL DOGS RAW COUNT:", allDogs.length);
  
  if (allDogs.length > 0) {
    console.log("FIRST DOG:", allDogs[0]);
  }
}
check().finally(() => prisma.$disconnect());
