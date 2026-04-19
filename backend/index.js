const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Exponer la carpeta uploads de manera estática
app.use('/uploads', express.static('uploads'));

// Rutas
app.get('/', (req, res) => {
  res.send('API K9 Funcional');
});

// Registrar routers a futuro aquí
app.use('/api/dogs', require('./src/routes/dog.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
