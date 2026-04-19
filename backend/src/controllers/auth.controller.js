const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'guia'
      }
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Manejo explícito de variables críticas
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined.');
      return res.status(500).json({ message: 'Error de configuración del servidor (JWT)' });
    }

    console.log(`Intento de login para: ${email}`);

    // 2. Consulta a Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.warn(`Login fallido: Usuario no encontrado (${email})`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 3. Verificación de Password (Bcrypt)
    if (!user.password) {
      console.error(`ERROR: El usuario ${email} no tiene una contraseña definida en la DB.`);
      return res.status(500).json({ message: 'Error en los datos del usuario' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Login fallido: Contraseña incorrecta para ${email}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 4. Generación de Token
    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`Login exitoso: ${email} (ID: ${user.id})`);

    res.json({ 
      token, 
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } 
    });
  } catch (error) {
    // LOG DETALLADO PARA RENDER
    console.error('--- ERROR EN LOGIN ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('----------------------');
    
    res.status(500).json({ 
      message: 'Error interno en el servidor', 
      error: error.message 
    });
  }
};

module.exports = { register, login };
