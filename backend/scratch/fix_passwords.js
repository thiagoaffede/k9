const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswords() {
  console.log('--- Iniciando Saneamiento de Contraseñas ---');
  
  const users = await prisma.user.findMany();
  console.log(`Buscando en ${users.length} usuarios...`);

  let updatedCount = 0;

  for (const user of users) {
    // Bcrypt hashes validos suelen empezar con $2a$ o $2b$
    const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));

    if (!isHashed && user.password) {
      console.log(`Hasheando contraseña para: ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      updatedCount++;
    }
  }

  console.log(`\n✅ Proceso completado. Usuarios actualizados: ${updatedCount}`);
}

fixPasswords()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
