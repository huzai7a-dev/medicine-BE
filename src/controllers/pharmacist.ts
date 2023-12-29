import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { paginate } from "../libs/utils";

const prisma = new PrismaClient();

const getFullMedicines = async (req: Request, res: Response) => {
  const isPublic = req.query.deleted === "true" ? false : true;
  const findBy = req.query.findBy;
  const value = req.query.value;

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;

  let searchQuery = {
    is_public: isPublic,
  };
  if (findBy) {
    const findObj = {
      ...searchQuery,
      [findBy as unknown as string]: {
        contains: value,
      },
    };
    searchQuery = findObj;
  }
  try {
    const totalCount = await prisma.medicineDetails.count();
    const pagination = paginate(totalCount, page, pageSize);
    const medicines = await prisma.medicineDetails.findMany({
      skip: page - 1,
      take: pageSize,
      where: searchQuery,
    });

    res.send({
      data: medicines,
      pagination,
    });
  } catch (error) {
    console.log(error);
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
