const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://k9-emmo.onrender.com',
  'https://seccioncanes.com',
  /\.vercel\.app$/ // Matches Vercel preview deploys
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
// Exponer la carpeta uploads de manera estática
app.use('/uploads', express.static('uploads'));

// Health check para Render
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Rutas
app.get('/', (req, res) => {
  res.json({
    status: "online",
    service: "Sección Canes U4",
    message: "API Activa y Operativa",
    timestamp: new Date()
  });
});

// Registrar routers a futuro aquí
app.use('/api/dogs', require('./src/routes/dog.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
