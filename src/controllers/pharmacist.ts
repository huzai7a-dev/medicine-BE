import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { paginate } from "../libs/utils";

const prisma = new PrismaClient();

const getFullMedicines = async (req: Request, res: Response): Promise<void> => {
  const isPublic = req.query.deleted === "true" ? false : true;
  const findBy = req.query.findBy as string | undefined;
  const value = req.query.value as string | undefined;
  const dosageForm = req.query.dosageForm as string;

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;

  let searchQuery: { [key: string]: any } = {
    is_public: isPublic,
  };

  if (findBy) {
    if (!dosageForm) {
      res.status(400).send("Dosage form is required");
      return;
    }
    searchQuery = {
      ...searchQuery,
      [findBy]: {
        contains: value,
      },
      dosage_form: dosageForm,
    };
  }

  try {
    if (!findBy) {
      const totalCount = await prisma.medicineDetails.count({
        where: searchQuery,
      });
      const pagination = paginate(totalCount, page, pageSize);

      const medicines = await prisma.medicineDetails.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: searchQuery,
      });

      // Extract distinct dosage forms from the paginated data
      const milligramsList = [
        ...new Set(
          medicines.map((item) => item.milligrams?.split(" ").join("").replace(",", ""))
        ),
      ];

      res.send({
        data: medicines,
        pagination,
        milligramsList,
      });
    } else {
      const medicines = await prisma.medicineDetails.findMany({
        where: searchQuery,
      });

      // Since there's no pagination, we return all distinct dosage forms from the filtered data
      const milligramsList = [
        ...new Set(medicines.map((item) => item.milligrams?.split(" ").join("").replace(",", ""))),
      ];

      res.send({
        data: medicines,
        milligramsList,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server Error" });
  }
};

// Define or import the paginate function here

export default getFullMedicines;

const updateMedicine = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { remarks, milligrams, mrp, efficacy,is_public } = req.body;
  if (!remarks && !milligrams && !mrp && !efficacy)
    return res.status(400).send({ message: "Bad request" });

  const updatedMedicine = await prisma.medicineDetails.update({
    where: { id },
    data: {
      remarks,
      milligrams,
      mrp,
      efficacy,
      is_public
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
