const multer = require('multer');

// Usamos memoryStorage para no guardar archivos temporales en el disco efímero de Render
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

module.exports = upload;
