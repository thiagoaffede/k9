const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dumpPath = path.join(__dirname, 'migration_dump.json');
  if (!fs.existsSync(dumpPath)) {
    throw new Error('No se encontró el archivo migration_dump.json');
  }

  const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

  console.log('--- Iniciando Importación a Supabase (PostgreSQL) ---');

  // 1. Limpiar datos existentes (Opcional pero recomendado para evitar colisiones)
  // Descomentar si querés una base limpia antes de migrar
  /*
  console.log('- Limpiando tablas...');
  await prisma.history.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.vetControl.deleteMany();
  await prisma.training.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.feeding.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.dog.deleteMany();
  await prisma.user.deleteMany();
  */

  // 2. Importar Usuarios
  console.log(`- Importando Usuarios (${data.users.length})...`);
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        password: user.password,
        rol: user.rol
      }
    });
  }

  // 3. Importar Perros
  console.log(`- Importando Perros (${data.dogs.length})...`);
  for (const dog of data.dogs) {
    // Si el perro ya existe lo saltamos o actualizamos
    await prisma.dog.upsert({
      where: { id: dog.id },
      update: {},
      create: {
        ...dog,
        // Limpiar fechas si es necesario
        fecha_nacimiento: dog.fecha_nacimiento ? new Date(dog.fecha_nacimiento) : null,
        fecha_ingreso: dog.fecha_ingreso ? new Date(dog.fecha_ingreso) : null,
        deletedAt: dog.deletedAt ? new Date(dog.deletedAt) : null,
        createdAt: dog.createdAt ? new Date(dog.createdAt) : null,
        updatedAt: dog.updatedAt ? new Date(dog.updatedAt) : null,
      }
    });
  }

  // 4. Importar Tablas Relacionadas (Vacunas, Controles, etc.)
  const importSubEntity = async (table, items, label) => {
    console.log(`- Importando ${label} (${items.length})...`);
    for (const item of items) {
      await prisma[table].upsert({
        where: { id: item.id },
        update: {},
        create: {
          ...item,
          fecha: item.fecha ? new Date(item.fecha) : undefined,
          fecha_aplicacion: item.fecha_aplicacion ? new Date(item.fecha_aplicacion) : undefined,
          proxima_dosis: item.proxima_dosis ? new Date(item.proxima_dosis) : null,
          fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio) : undefined,
          fecha_fin: item.fecha_fin ? new Date(item.fecha_fin) : null,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        }
      });
    }
  };

  await importSubEntity('vaccine', data.vaccines, 'Vacunas');
  await importSubEntity('vetControl', data.vetControls, 'Controles Médicos');
  await importSubEntity('training', data.trainings, 'Entrenamientos');
  await importSubEntity('assignment', data.assignments, 'Asignaciones');
  await importSubEntity('history', data.history, 'Historial');
  await importSubEntity('incident', data.incidents, 'Incidentes');
  await importSubEntity('feeding', data.feedings, 'Alimentación');

  console.log('\n--- Reajustando Secuencias de IDs en PostgreSQL ---');
  // Script para que los próximos autoincrementales sean correctos
  const tables = ['User', 'Dog', 'Vaccine', 'VetControl', 'Training', 'Assignment', 'History', 'Incident', 'Feeding'];
  for (const table of tables) {
     const tableName = table === 'User' ? '"User"' : table; // Handle Reserved word User
     await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE(MAX(id), 1)) FROM ${tableName};`);
  }

  console.log('\n✅ Migración completada exitosamente.');
}

main()
  .catch(e => {
    console.error('❌ Error en la importación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
