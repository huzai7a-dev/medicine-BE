import express, {Request,Response} from 'express';

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router();

router.get('/find-by', async (req:Request,res:Response) => {
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

    res.send(medicines);
})

export default router