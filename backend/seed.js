const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({ where: { email: 'admin@k9.com' } });
  
  if (existingUser) {
    console.log('El usuario admin ya existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      nombre: 'Administrador K9',
      email: 'admin@k9.com',
      password: hashedPassword,
      rol: 'admin' // ENUM simulado: admin, veterinario, instructor, guia
    }
  });

  console.log('✅ Usuario Administrador creado exitosamente.');
  console.log('--- Credenciales ---');
  console.log('Email: admin@k9.com');
  console.log('Clave: admin123');
  console.log('--------------------');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
