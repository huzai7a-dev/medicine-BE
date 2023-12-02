import express from 'express';
import multer from 'multer';
import { getFindBy, searchPrescription, uploadPrescription } from '../controllers';

const router = express.Router();
const upload = multer({ dest: 'uploads/',storage:multer.memoryStorage()})

router.get('/find-by', getFindBy);
router.post('/upload-prescription', upload.single('image'),uploadPrescription);
router.post('/search-prescription',searchPrescription);


export default router