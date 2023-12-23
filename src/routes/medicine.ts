import express from 'express';
import multer from 'multer';
import { getAllMedicines, getFindBy, searchPrescription, uploadPrescription } from '../controllers/medicine';

const router = express.Router();
const upload = multer({ dest: 'uploads/',storage:multer.memoryStorage()})

router.get('/get-all-medicines',getAllMedicines);
router.post('/find-by', getFindBy);
router.post('/upload-prescription', upload.single('image'),uploadPrescription);
router.post('/search-prescription',searchPrescription);

export default router