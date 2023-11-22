import express, {Request,Response} from 'express';

import { PrismaClient } from '@prisma/client'
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import textract from '../helpers/Extrator';

const prisma = new PrismaClient()
const router = express.Router();
const upload = multer({ dest: 'uploads/',storage:multer.memoryStorage()})

router.get('/find-by', async (req: Request, res: Response) => {
  const searchCriteria = req.query.searchCriteria;
  const searchQuery = req.query.searchQuery;

  if (!['company_name', 'brand_name', 'formulation'].includes(searchCriteria as unknown as string)) {
    return res.status(400).json({ error: 'Invalid searchCriteria' });
  }
  const medicines = await prisma.medicineDetails.findMany({
    where: {
      [searchCriteria as unknown as string]: {
        contains: searchQuery,
      },
    },
    select: {
      brand_name: true,
      company_name: true,
      dosage_form: true,
      formulation: true,
      mrp: true,
      pack_size: true,
      reg_no: true,
    },
  });

  res.send({data:medicines,search:searchQuery});
});

router.post('/upload-prescription', upload.single('image'),async(req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const params = {
    Document: {
      Bytes: req.file.buffer
    }
  };
  
  textract.detectDocumentText(params, function (err, data) {
    if (err) {
      console.error("Error:", err);
      return res.status(500).send(err);
    } else {
      console.log("Detected text:", data);
      const response = data.Blocks?.map((block) => {
        return block?.Text
      });
      return res.status(200).send(response);
    }
  });
});


router.post('/search-prescription', async (req: Request, res: Response) => {
  try {
      const brandNames: string[] = req.body.brandNames;

      if (!brandNames || brandNames.length === 0) {
          return res.status(400).json({ message: 'No brand names provided' });
      }

      const searchResults = await Promise.all(
          brandNames.map(async (brandName) => {
              const result = await prisma.medicineDetails.findMany({
                where: {
                  brand_name: {
                      contains: brandName,
                  },
              },
              });
              return { brandName, brands: result };
          })
      );

      res.json(searchResults);
  } catch (error) {
      res.status(500).json({ message: 'Error searching for medicines', error });
  }
});


export default router