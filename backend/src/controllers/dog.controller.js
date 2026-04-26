const prisma = require('../config/db');
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require('../config/s3');
const path = require('path');
const sharp = require('sharp');

// Helper para crear historial automático
const addHistoryLog = async (id_perro, tipo_evento, descripcion, responsable) => {
  await prisma.history.create({
    data: { id_perro, tipo_evento, descripcion, responsable }
  });
};

const getDogs = async (req, res) => {
  try {
    const { nombre, estado, guia } = req.query;
    
    // Filtros base y soft delete
    const whereClause = { deletedAt: null };
    
    if (nombre) whereClause.nombre = { contains: nombre };
    if (estado) whereClause.estado = estado;
    if (guia) {
      whereClause.assignments = {
        some: { guia: { contains: guia }, fecha_fin: null }
      };
    }

    const dogs = await prisma.dog.findMany({
      where: whereClause,
      include: {
        vaccines: { orderBy: { fecha_aplicacion: 'desc' } },
        vetControls: { orderBy: { fecha: 'desc' } },
        assignments: { where: { fecha_fin: null } }
      }
    });

    res.json(dogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dogs', error: error.message });
  }
};

const getDogById = async (req, res) => {
  try {
    const dog = await prisma.dog.findUnique({
      where: { id: parseInt(req.params.id), deletedAt: null },
      include: {
        vaccines: { orderBy: { fecha_aplicacion: 'desc' } },
        vetControls: { orderBy: { fecha: 'desc' } },
        feedings: { orderBy: { fecha_inicio: 'desc' } },
        trainings: { orderBy: { fecha: 'desc' } },
        assignments: { orderBy: { fecha_inicio: 'desc' } },
        history: { orderBy: { fecha: 'desc' } },
        incidents: { orderBy: { fecha: 'desc' } },
      }
    });

    if (!dog) return res.status(404).json({ message: 'Dog not found' });
    res.json(dog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dog', error: error.message });
  }
};

const createDog = async (req, res) => {
  try {
    const data = { ...req.body };
    // Evitar Unique Constraint de Prisma en nro_chip vacio
    if (!data.nro_chip || data.nro_chip.trim() === '') {
      data.nro_chip = null;
    }
    if (data.fecha_nacimiento) {
      data.fecha_nacimiento = new Date(data.fecha_nacimiento);
    }
    const dog = await prisma.dog.create({ data });
    await addHistoryLog(dog.id, 'CREACION', 'Perro registrado en el sistema', req.user.nombre);
    res.status(201).json(dog);
  } catch (error) {
    res.status(500).json({ message: 'Error creating dog', error: error.message });
  }
};

const updateDog = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      nombre, raza, sexo, color, senas_particulares, 
      nro_chip, estado, origen, observaciones, fecha_nacimiento 
    } = req.body;

    const data = { 
      nombre, raza, sexo, color, senas_particulares, 
      estado, origen, observaciones 
    };

    if (fecha_nacimiento) {
      data.fecha_nacimiento = new Date(fecha_nacimiento);
    }

    // Manejo de nro_chip para evitar Unique Constraint con strings vacíos
    if (nro_chip === undefined) {
      // Si no se envía el campo, no lo tocamos
    } else if (!nro_chip || nro_chip.trim() === '') {
      data.nro_chip = null;
    } else {
      data.nro_chip = nro_chip;
    }

    const dog = await prisma.dog.update({ 
      where: { id }, 
      data 
    });

    await addHistoryLog(dog.id, 'MODIFICACION', 'Datos generales del perro actualizados', req.user.nombre);
    res.json(dog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dog', error: error.message });
  }
};

const deleteDog = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Soft Delete
    await prisma.dog.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await addHistoryLog(id, 'ELIMINACION', 'Perro eliminado del sistema (Soft Delete)', req.user.nombre);
    res.json({ message: 'Perro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando perro', error: error.message });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const id = parseInt(req.params.id);
    
    // Procesar imagen con sharp: Redimensionar y convertir a WebP
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, withoutEnlargement: true }) // Máximo 1024px de ancho
      .webp({ quality: 80 }) // Convertir a WebP con calidad 80
      .toBuffer();

    const fileName = `dogs/${id}-${Date.now()}.webp`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: optimizedBuffer,
      ContentType: 'image/webp',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const projectURL = process.env.S3_ENDPOINT.split('.storage')[0]; 
    const photoUrl = `${projectURL}.supabase.co/storage/v1/object/public/${process.env.S3_BUCKET}/${fileName}`;
    
    const currentDog = await prisma.dog.findUnique({ where: { id } });
    if (currentDog && currentDog.foto_url && currentDog.foto_url.includes(process.env.S3_BUCKET)) {
      try {
        const oldKey = currentDog.foto_url.split(`${process.env.S3_BUCKET}/`)[1];
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: oldKey
        }));
      } catch (err) {
        console.error("Error al borrar foto antigua:", err.message);
      }
    }

    await prisma.dog.update({
      where: { id },
      data: { foto_url: photoUrl }
    });
    
    await addHistoryLog(id, 'FOTO', 'Foto optimizada (WebP) subida a Supabase', req.user.nombre);
    res.json({ message: 'Photo uploaded and optimized', photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const uploadMedicalDoc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const id_perro = parseInt(req.params.id);
    
    let bufferToUpload = req.file.buffer;
    let contentType = req.file.mimetype;
    let fileName = `docs/${id_perro}-${Date.now()}${path.extname(req.file.originalname)}`;

    // Si es una imagen, la optimizamos
    if (req.file.mimetype.startsWith('image/')) {
      bufferToUpload = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = 'image/webp';
      fileName = `docs/${id_perro}-${Date.now()}.webp`;
    }
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: bufferToUpload,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const projectURL = process.env.S3_ENDPOINT.split('.storage')[0]; 
    const docUrl = `${projectURL}.supabase.co/storage/v1/object/public/${process.env.S3_BUCKET}/${fileName}`;

    await addHistoryLog(id_perro, 'DOCUMENTO', `Adjunto médico subido y optimizado: ${docUrl}`, req.user.nombre);
    res.json({ message: 'Documento subido', docUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

// --- Sub-entidades (Creación) ---

const addAssignment = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const data = req.body;
    await prisma.assignment.updateMany({
      where: { id_perro, fecha_fin: null },
      data: { fecha_fin: new Date() }
    });
    const assignment = await prisma.assignment.create({ data: { ...data, id_perro } });
    await addHistoryLog(id_perro, 'ASIGNACION', `Nueva asignación: Guía ${data.guia}`, req.user.nombre);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { aid } = req.params;
    await prisma.assignment.delete({ where: { id: parseInt(aid) } });
    res.json({ message: 'Asignación eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const addVaccine = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    // Asegurarnos que las fechas vengan tipadas correctamente
    const fecha_aplicacion = new Date(req.body.fecha_aplicacion);
    const proxima_dosis = req.body.proxima_dosis ? new Date(req.body.proxima_dosis) : null;

    const vaccine = await prisma.vaccine.create({ 
      data: { ...req.body, fecha_aplicacion, proxima_dosis, id_perro } 
    });
    await addHistoryLog(id_perro, 'VACUNA', `Aplicada: ${req.body.vacuna}`, req.user.nombre);
    res.status(201).json(vaccine);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deleteVaccine = async (req, res) => {
   try {
      const { id, vid } = req.params;
      await prisma.vaccine.delete({ where: { id: parseInt(vid) } });
      await addHistoryLog(parseInt(id), 'VACUNA_BORRADA', 'Se eliminó registro de vacuna', req.user.nombre);
      res.json({ message: 'Vacuna borrada' });
   } catch(e) { res.status(500).json({error: e.message}) }
}

const addVetControl = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const fecha = req.body.fecha ? new Date(req.body.fecha) : new Date();
    const control = await prisma.vetControl.create({ data: { ...req.body, fecha, id_perro } });
    await addHistoryLog(id_perro, 'CONTROL_VET', `Motivo: ${req.body.motivo}`, req.user.nombre);
    res.status(201).json(control);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const addFeeding = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const { tipo_alimento, marca, cantidad_diaria, horario, suplementos, cambios_dieta, observaciones, fecha_inicio } = req.body;
    
    const feed = await prisma.feeding.create({ 
      data: { 
        id_perro,
        tipo_alimento, 
        marca, 
        cantidad_diaria, 
        horario, 
        suplementos, 
        cambios_dieta, 
        observaciones,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date() 
      } 
    });

    await addHistoryLog(id_perro, 'ALIMENTACION', `Dieta act.: ${tipo_alimento}`, req.user.nombre);
    res.status(201).json(feed);
  } catch (error) {
    console.error("ERROR EN ADD_FEEDING:", error);
    res.status(500).json({ message: 'Error al registrar alimentación', error: error.message });
  }
};

const addTraining = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const fecha = req.body.fecha ? new Date(req.body.fecha) : new Date();
    const training = await prisma.training.create({ data: { ...req.body, fecha, id_perro } });
    await addHistoryLog(id_perro, 'ENTRENAMIENTO', `Tipo: ${req.body.tipo}`, req.user.nombre);
    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deleteFeeding = async (req, res) => {
  try {
    const { id, fid } = req.params;
    await prisma.feeding.delete({ where: { id: parseInt(fid) } });
    await addHistoryLog(parseInt(id), 'ALIMENTACION_BORRADA', 'Se eliminó un registro de alimentación', req.user.nombre);
    res.json({ message: 'Registro de alimentación borrado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar alimentación', error: error.message });
  }
};

const addIncident = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const fecha = req.body.fecha ? new Date(req.body.fecha) : new Date();
    const incident = await prisma.incident.create({ data: { ...req.body, fecha, id_perro } });
    await addHistoryLog(id_perro, 'INCIDENTE', `Tipo: ${req.body.tipo}`, req.user.nombre);
    
    // Si el incidente es fallecimiento, podríamos opcionalmente cambiar el estado del perro
    if (req.body.tipo === 'Fallecimiento') {
      await prisma.dog.update({ where: { id: id_perro }, data: { estado: 'retirado' } });
    }

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deleteIncident = async (req, res) => {
  try {
    const { iid } = req.params;
    await prisma.incident.delete({ where: { id: parseInt(iid) } });
    res.json({ message: 'Incidente eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = {
  getDogs, getDogById, createDog, updateDog, deleteDog, uploadPhoto, uploadMedicalDoc,
  addAssignment, deleteAssignment, addVaccine, deleteVaccine, addVetControl, 
  addFeeding, deleteFeeding, addIncident, deleteIncident, addTraining
};
