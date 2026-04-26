const express = require('express');
const { 
  getDogs, getDogById, createDog, updateDog, deleteDog, uploadPhoto, uploadMedicalDoc, 
  addAssignment, deleteAssignment, addVaccine, deleteVaccine, addVetControl, 
  addFeeding, deleteFeeding, addIncident, deleteIncident, addTraining 
} = require('../controllers/dog.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDogs);
router.get('/:id', getDogById);

router.post('/', roleMiddleware(['admin', 'veterinario', 'instructor']), createDog);
router.put('/:id', roleMiddleware(['admin', 'veterinario', 'instructor']), updateDog);
router.delete('/:id', roleMiddleware(['admin']), deleteDog); // Soft Delete
router.post('/:id/photo', upload.single('photo'), uploadPhoto);
router.post('/:id/documents', upload.single('doc'), uploadMedicalDoc);

// Subentities
router.post('/:id/assignments', roleMiddleware(['admin']), addAssignment);
router.delete('/:id/assignments/:aid', roleMiddleware(['admin']), deleteAssignment);
router.post('/:id/vaccines', roleMiddleware(['admin', 'veterinario']), addVaccine);
router.delete('/:id/vaccines/:vid', roleMiddleware(['admin', 'veterinario']), deleteVaccine);
router.post('/:id/vetcontrols', roleMiddleware(['admin', 'veterinario']), addVetControl);
router.post('/:id/feedings', roleMiddleware(['admin', 'veterinario', 'guia']), addFeeding);
router.delete('/:id/feedings/:fid', roleMiddleware(['admin', 'veterinario']), deleteFeeding);
router.post('/:id/incidents', roleMiddleware(['admin', 'veterinario', 'instructor', 'guia']), addIncident);
router.delete('/:id/incidents/:iid', roleMiddleware(['admin']), deleteIncident);
router.post('/:id/trainings', roleMiddleware(['admin', 'instructor']), addTraining);

module.exports = router;
