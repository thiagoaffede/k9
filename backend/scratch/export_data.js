const { PrismaClient } = require('../prisma/generated/sqlserver');
const fs = require('fs');
const path = require('path');

const prismaOld = new PrismaClient();

async function main() {
  console.log('--- Iniciando Exportación desde SQL Server ---');
  
  const data = {
    users: await prismaOld.user.findMany(),
    dogs: await prismaOld.dog.findMany(),
    vaccines: await prismaOld.vaccine.findMany(),
    vetControls: await prismaOld.vetControl.findMany(),
    feedings: await prismaOld.feeding.findMany(),
    trainings: await prismaOld.training.findMany(),
    assignments: await prismaOld.assignment.findMany(),
    history: await prismaOld.history.findMany(),
    incidents: await prismaOld.incident.findMany()
  };

  console.log(`- Usuarios: ${data.users.length}`);
  console.log(`- Perros: ${data.dogs.length}`);
  console.log(`- Vacunas: ${data.vaccines.length}`);
  console.log(`- Controles: ${data.vetControls.length}`);
  console.log(`- Entrenamientos: ${data.trainings.length}`);

  const dumpPath = path.join(__dirname, 'migration_dump.json');
  fs.writeFileSync(dumpPath, JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Datos exportados correctamente a: ${dumpPath}`);
}

main()
  .catch(e => {
    console.error('❌ Error en la exportación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaOld.$disconnect();
  });
