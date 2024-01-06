import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import textract from "../libs/extrator";
import { paginate } from "../libs/utils";

interface PrescriptionDto {
  brandName: string;
  dosageForm?: string;
}

const prisma = new PrismaClient();

const getFindBy = async (req: Request, res: Response) => {
  const searchCriteria: string = req.body.searchCriteria;
  const searchQuery: string = req.body.searchQuery;
  const dosageForm: string = req.body.dosageForm;

  if (
    !["company_name", "brand_name", "formula"].includes(
      searchCriteria as unknown as string
    )
  ) {
    return res.status(400).json({ error: "Invalid searchCriteria" });
  }

  if (!searchQuery)
    return res.status(400).send({ error: "searchQuery is required" });

  const medicines = await prisma.medicineDetails.findMany({
    where: {
      [searchCriteria as unknown as string]: {
        contains: searchQuery,
      },
      dosage_form: dosageForm,
      is_public: true,
      efficacy: { not: null },
    },
    select: {
      id: true,
      brand_name: true,
      company_name: true,
      dosage_form: true,
      formula: true,
      milligrams: true,
      mrp: true,
      pack_size: true,
      reg_no: true,
      efficacy: true,
    },
  });

  const milligramsList = [
    ...new Set(
      medicines.map((item) =>
        item.milligrams?.split(" ").join("").replace(",", "")
      )
    ),
  ];
  res.send({ data: medicines, search: searchQuery, milligramsList });
};

const uploadPrescription = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const params = {
    Document: {
      Bytes: req.file.buffer,
    },
  };

  textract.detectDocumentText(params, async (err, data) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).send(err);
    } else {
      const extractedText: { brandName: string }[] = [];

      if (data.Blocks) {
        data.Blocks.forEach((block) => {
          if (block.BlockType === "LINE" && block.Text) {
            extractedText.push({ brandName: block.Text });
          }
        });
      }
      if (extractedText.length === 0) res.send("No result found");
      try {
        const result = await searchBrandFormulations(extractedText);
        return res.status(200).send(result);
      } catch (error) {
        console.log(error);
        return res.status(500).send("Server Error");
      }
    }
  });
};

const searchPrescription = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.body.searchQuery as PrescriptionDto[];

    if (!searchQuery || searchQuery.length === 0) {
      return res.status(400).json({ message: "No brand names provided" });
    }

    const searchResults = await searchBrandFormulations(searchQuery);
    res.send(searchResults);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error searching for medicines", error });
  }
};

const getAllMedicines = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;

  try {
    // Get total number of records
    const totalCount = await prisma.medicineDetails.count();
    const pagination = paginate(totalCount, page, pageSize);
    // Get paginated records
    const medicines = await prisma.medicineDetails.findMany({
      where: { is_public: true, efficacy: { not: null } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        brand_name: true,
        company_name: true,
        dosage_form: true,
        formula: true,
        mrp: true,
        milligrams: true,
        remarks: true,
        pack_size: true,
        reg_no: true,
        efficacy: true,
      },
    });

    const milligramsList = [
      ...new Set(
        medicines.map((item) =>
          item.milligrams?.split(" ").join("").replace(",", "")
        )
      ),
    ];

    return res.status(200).send({
      data: medicines,
      pagination,
      milligramsList,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

const searchBrandFormulations = async (searchQuery: PrescriptionDto[]) => {
  const searchResults = await Promise.all(
    searchQuery.map(async ({ brandName, dosageForm }) => {
      // Find all unique formulations for this brand name
      let selectQuery = {
        brand_name: {
          contains: brandName,
        },
        is_public: true,
        efficacy: { not: null },
      };

      if (dosageForm) {
        const queryWithDosageForm = {
          ...selectQuery,
          dosage_form: dosageForm,
        };
        selectQuery = queryWithDosageForm;
      }

      const formulations = await prisma.medicineDetails.findMany({
        where: selectQuery,
        select: {
          formula: true,
        },
      });
      const uniqueFormulations = [
        ...new Set(formulations.map((f) => f.formula)),
      ];

      // Create an array to hold all the brands for each formulation
      let brandsWithFormulation: any[] = [];

      // For each formulation, find all brands that have this formulation
      for (let formula of uniqueFormulations) {
        const brands = await prisma.medicineDetails.findMany({
          where: {
            formula: formula,
            is_public: true,
            efficacy: { not: null },
            dosage_form: dosageForm,
          },
          select: {
            id: true,
            brand_name: true,
            company_name: true,
            dosage_form: true,
            formula: true,
            milligrams: true,
            mrp: true,
            pack_size: true,
            reg_no: true,
            efficacy: true,
          },
        });

        // Add the brands to the array
        brandsWithFormulation = brandsWithFormulation.concat(brands);
      }

      return { brandName, brands: brandsWithFormulation };
    })
  );
  return searchResults;
};
export { getFindBy, uploadPrescription, searchPrescription, getAllMedicines };
