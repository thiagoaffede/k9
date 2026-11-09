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

// Helper: valida una fecha recibida del formulario (yyyy-mm-dd o ISO)
const parseFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return isNaN(fecha.getTime()) ? null : fecha;
};

// Helper: recorta strings opcionales y convierte vacíos en null
const textoOpcional = (valor) => {
  if (typeof valor !== 'string') return valor ?? null;
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
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
    if (!data.nombre || String(data.nombre).trim() === '') {
      return res.status(400).json({ message: 'El nombre del perro es obligatorio' });
    }
    if (!data.sexo || String(data.sexo).trim() === '') {
      return res.status(400).json({ message: 'El sexo del perro es obligatorio' });
    }
    // Evitar Unique Constraint de Prisma en nro_chip vacio
    if (!data.nro_chip || data.nro_chip.trim() === '') {
      data.nro_chip = null;
    }
    if (data.fecha_nacimiento) {
      const fecha = parseFecha(data.fecha_nacimiento);
      if (!fecha) return res.status(400).json({ message: 'Fecha de nacimiento inválida' });
      data.fecha_nacimiento = fecha;
    }
    const dog = await prisma.dog.create({ data });
    await addHistoryLog(dog.id, 'CREACION', 'Perro registrado en el sistema', req.user.nombre);
    res.status(201).json(dog);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Ya existe un perro registrado con ese número de chip' });
    }
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

    // Solo validamos si el cliente manda el campo: permite actualizaciones
    // parciales (por ejemplo, cambiar únicamente la fecha o la foto).
    if (nombre !== undefined && (!nombre || String(nombre).trim() === '')) {
      return res.status(400).json({ message: 'El nombre del perro es obligatorio' });
    }
    if (sexo !== undefined && (!sexo || String(sexo).trim() === '')) {
      return res.status(400).json({ message: 'El sexo del perro es obligatorio' });
    }

    // Permite limpiar la fecha mandando '' o null; valida formatos inválidos.
    if (fecha_nacimiento !== undefined) {
      if (!fecha_nacimiento) {
        data.fecha_nacimiento = null;
      } else {
        const fecha = parseFecha(fecha_nacimiento);
        if (!fecha) return res.status(400).json({ message: 'Fecha de nacimiento inválida' });
        data.fecha_nacimiento = fecha;
      }
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
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Ya existe otro perro registrado con ese número de chip' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Perro no encontrado' });
    }
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

const deletePhoto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dog = await prisma.dog.findUnique({ where: { id } });
    if (!dog) return res.status(404).json({ message: 'Perro no encontrado' });

    // Si la foto está en nuestro bucket, borramos también el archivo remoto.
    if (dog.foto_url && dog.foto_url.includes(process.env.S3_BUCKET)) {
      try {
        const oldKey = dog.foto_url.split(`${process.env.S3_BUCKET}/`)[1];
        if (oldKey) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: oldKey
          }));
        }
      } catch (err) {
        console.error("Error al borrar foto de Supabase:", err.message);
      }
    }

    await prisma.dog.update({ where: { id }, data: { foto_url: null } });
    await addHistoryLog(id, 'FOTO', 'Foto de perfil eliminada', req.user.nombre);
    res.json({ message: 'Foto eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la foto', error: error.message });
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
    const { guia, turno, fecha_inicio, observaciones } = req.body;

    if (!guia || String(guia).trim() === '') {
      return res.status(400).json({ message: 'Tenés que seleccionar un guía' });
    }

    const fechaInicio = fecha_inicio ? parseFecha(fecha_inicio) : new Date();
    if (!fechaInicio) return res.status(400).json({ message: 'Fecha de inicio inválida' });
    
    // Finalizar asignaciones anteriores activas
    await prisma.assignment.updateMany({
      where: { id_perro, fecha_fin: null },
      data: { fecha_fin: new Date() }
    });

    const assignment = await prisma.assignment.create({ 
      data: { 
        id_perro,
        guia: String(guia).trim(),
        turno: textoOpcional(turno),
        observaciones: textoOpcional(observaciones),
        fecha_inicio: fechaInicio
      } 
    });

    await addHistoryLog(id_perro, 'ASIGNACION', `Nueva asignación: Guía ${guia}`, req.user.nombre);
    res.status(201).json(assignment);
  } catch (error) {
    console.error("ERROR EN ADD_ASSIGNMENT:", error);
    res.status(500).json({ message: 'Error al asignar guía', error: error.message });
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

const TIPOS_VACUNA = ['vacuna', 'antiparasitario', 'desparasitacion'];

const addVaccine = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const { vacuna, proxima_dosis, veterinario, observaciones, tipo } = req.body;

    if (!vacuna || String(vacuna).trim() === '') {
      return res.status(400).json({ message: 'El nombre de la vacuna o producto es obligatorio' });
    }

    const fechaAplicacion = parseFecha(req.body.fecha_aplicacion);
    if (!fechaAplicacion) {
      return res.status(400).json({ message: 'La fecha de aplicación es obligatoria' });
    }

    const fechaProxima = proxima_dosis ? parseFecha(proxima_dosis) : null;
    if (proxima_dosis && !fechaProxima) {
      return res.status(400).json({ message: 'La próxima dosis tiene una fecha inválida' });
    }

    // Whitelist: ignora campos no permitidos (id, id_perro, createdAt...) y valida el enum
    const tipoFinal = TIPOS_VACUNA.includes(tipo) ? tipo : 'vacuna';

    const vaccine = await prisma.vaccine.create({ 
      data: {
        id_perro,
        vacuna: String(vacuna).trim(),
        tipo: tipoFinal,
        fecha_aplicacion: fechaAplicacion,
        proxima_dosis: fechaProxima,
        veterinario: textoOpcional(veterinario),
        observaciones: textoOpcional(observaciones)
      }
    });
    await addHistoryLog(id_perro, 'VACUNA', `Aplicada (${tipoFinal}): ${vacuna}`, req.user.nombre);
    res.status(201).json(vaccine);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la vacuna', error: error.message });
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
    const { motivo, fecha, diagnostico, tratamiento, medicacion, dosis, veterinario, observaciones } = req.body;

    if (!motivo || String(motivo).trim() === '') {
      return res.status(400).json({ message: 'El motivo del control es obligatorio' });
    }

    const fechaControl = fecha ? parseFecha(fecha) : new Date();
    if (!fechaControl) return res.status(400).json({ message: 'La fecha del control es inválida' });

    const control = await prisma.vetControl.create({
      data: {
        id_perro,
        motivo: String(motivo).trim(),
        fecha: fechaControl,
        diagnostico: textoOpcional(diagnostico),
        tratamiento: textoOpcional(tratamiento),
        medicacion: textoOpcional(medicacion),
        dosis: textoOpcional(dosis),
        veterinario: textoOpcional(veterinario),
        observaciones: textoOpcional(observaciones)
      }
    });
    await addHistoryLog(id_perro, 'CONTROL_VET', `Motivo: ${motivo}`, req.user.nombre);
    res.status(201).json(control);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el control veterinario', error: error.message });
  }
};

const deleteVetControl = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const cid = parseInt(req.params.cid);

    // Verificar que el control pertenezca al perro del URL (evita IDOR)
    const control = await prisma.vetControl.findFirst({ where: { id: cid, id_perro } });
    if (!control) {
      return res.status(404).json({ message: 'Control veterinario no encontrado' });
    }

    await prisma.vetControl.delete({ where: { id: cid } });
    await addHistoryLog(id_perro, 'CONTROL_VET_BORRADO', `Se eliminó control: ${control.motivo}`, req.user.nombre);
    res.json({ message: 'Control veterinario eliminado' });
  } catch (error) {
    console.error("ERROR EN DELETE_VETCONTROL:", error);
    res.status(500).json({ message: 'Error al borrar el control veterinario', error: error.message });
  }
};

const addFeeding = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const { tipo_alimento, marca, cantidad_diaria, horario, suplementos, cambios_dieta, observaciones, fecha_inicio } = req.body;

    if (!tipo_alimento || String(tipo_alimento).trim() === '') {
      return res.status(400).json({ message: 'El tipo de alimento es obligatorio' });
    }

    const fechaInicio = fecha_inicio ? parseFecha(fecha_inicio) : new Date();
    if (!fechaInicio) return res.status(400).json({ message: 'La fecha de inicio es inválida' });

    const feed = await prisma.feeding.create({ 
      data: { 
        id_perro,
        tipo_alimento: String(tipo_alimento).trim(),
        marca: textoOpcional(marca),
        cantidad_diaria: textoOpcional(cantidad_diaria),
        horario: textoOpcional(horario),
        suplementos: textoOpcional(suplementos),
        cambios_dieta: textoOpcional(cambios_dieta),
        observaciones: textoOpcional(observaciones),
        fecha_inicio: fechaInicio
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
    const { tipo, nivel, fecha, evaluacion, observaciones, instructor } = req.body;

    if (!tipo || String(tipo).trim() === '') {
      return res.status(400).json({ message: 'El tipo de entrenamiento es obligatorio' });
    }

    const fechaTraining = fecha ? parseFecha(fecha) : new Date();
    if (!fechaTraining) return res.status(400).json({ message: 'La fecha del entrenamiento es inválida' });

    const training = await prisma.training.create({
      data: {
        id_perro,
        tipo: String(tipo).trim(),
        nivel: textoOpcional(nivel),
        evaluacion: textoOpcional(evaluacion),
        observaciones: textoOpcional(observaciones),
        instructor: textoOpcional(instructor) || req.user.nombre || null,
        fecha: fechaTraining
      }
    });
    await addHistoryLog(id_perro, 'ENTRENAMIENTO', `Tipo: ${tipo}`, req.user.nombre);
    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el entrenamiento', error: error.message });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const id_perro = parseInt(req.params.id);
    const tid = parseInt(req.params.tid);

    // Verificar que el entrenamiento pertenezca al perro del URL (evita IDOR)
    const training = await prisma.training.findFirst({ where: { id: tid, id_perro } });
    if (!training) {
      return res.status(404).json({ message: 'Registro de entrenamiento no encontrado' });
    }

    await prisma.training.delete({ where: { id: tid } });
    await addHistoryLog(id_perro, 'ENTRENAMIENTO_BORRADO', `Se eliminó: ${training.tipo}`, req.user.nombre);
    res.json({ message: 'Entrenamiento eliminado' });
  } catch (error) {
    console.error("ERROR EN DELETE_TRAINING:", error);
    res.status(500).json({ message: 'Error al borrar entrenamiento', error: error.message });
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
    const { tipo, descripcion, gravedad, fecha, acciones_tomadas } = req.body;

    if (!tipo || String(tipo).trim() === '') {
      return res.status(400).json({ message: 'El tipo de incidente es obligatorio' });
    }
    if (!descripcion || String(descripcion).trim() === '') {
      return res.status(400).json({ message: 'La descripción del incidente es obligatoria' });
    }
    if (!gravedad || !['baja', 'media', 'alta'].includes(gravedad)) {
      return res.status(400).json({ message: 'La gravedad debe ser baja, media o alta' });
    }

    const fechaIncidente = fecha ? parseFecha(fecha) : new Date();
    if (!fechaIncidente) return res.status(400).json({ message: 'La fecha del incidente es inválida' });

    const incident = await prisma.incident.create({
      data: {
        id_perro,
        tipo: String(tipo).trim(),
        descripcion: String(descripcion).trim(),
        gravedad,
        acciones_tomadas: textoOpcional(acciones_tomadas),
        fecha: fechaIncidente
      }
    });
    await addHistoryLog(id_perro, 'INCIDENTE', `Tipo: ${tipo}`, req.user.nombre);
    
    // Si el incidente es fallecimiento, podríamos opcionalmente cambiar el estado del perro
    if (tipo === 'Fallecimiento') {
      await prisma.dog.update({ where: { id: id_perro }, data: { estado: 'retirado' } });
    }

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el incidente', error: error.message });
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
  getDogs, getDogById, createDog, updateDog, deleteDog, uploadPhoto, deletePhoto, uploadMedicalDoc,
  addAssignment, deleteAssignment, addVaccine, deleteVaccine, addVetControl, deleteVetControl,
  addFeeding, deleteFeeding, addIncident, deleteIncident, addTraining, deleteTraining
};
