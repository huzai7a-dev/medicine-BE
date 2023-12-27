import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { paginate } from "../libs/utils";

const prisma = new PrismaClient();

const getFullMedicines = async (req: Request, res: Response) => {
  const brandName = req.query.brandName || undefined;
  const companyName = req.query.companyName || undefined;
  const formulaName = req.query.formula || undefined;
  const isPublic = req.query.deleted === "true" ? false : undefined;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;

  let queryConditions: any = {};

  if (req.query.brandName) {
    queryConditions.brand_name = brandName;
  }
  if (req.query.companyName) {
    queryConditions.company_name = companyName;
  }
  if (req.query.formula) {
    queryConditions.formula = formulaName;
  }
  if (req.query.deleted === "true") {
    queryConditions.is_public = isPublic;
  }
  try {
    const totalCount = await prisma.medicineDetails.count();
    const pagination = paginate(totalCount, page, pageSize);
    const medicines = await prisma.medicineDetails.findMany({
      where: queryConditions,
    });

    res.send({
      data: medicines,
      pagination,
    });
  } catch (error) {
    res.status(500).send({ error: "Server Error" });
  }
};

const updateMedicine = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { remarks, milligrams, mrp } = req.body;

  if (!remarks || !milligrams || !mrp)
    return res.status(400).send({ message: "Bas request" });

  const updatedMedicine = await prisma.medicineDetails.update({
    where: { id },
    data: {
      remarks,
      milligrams,
      mrp,
    },
  });

  res.status(200).send({ message: "medicine updated", data: updatedMedicine });
};

const deleteMedicine = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.medicineDetails.update({
    where: { id },
    data: { is_public: false },
  });
  res.status(200).send({ message: "Medicine deleted" });
};
export { getFullMedicines, updateMedicine, deleteMedicine };
