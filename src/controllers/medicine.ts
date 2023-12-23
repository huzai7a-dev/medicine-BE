import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import textract from "../libs/extrator";
import { paginate } from "../libs/utils";

const prisma = new PrismaClient();

const getFindBy = async (req: Request, res: Response) => {
  const searchCriteria: string = req.body.searchCriteria;
  const searchQuery: string = req.body.searchQuery;
  const dosageForm: string = req.body.dosageForm;

  if (
    !["company_name", "brand_name", "formulation"].includes(
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
    },
    select: {
      id: true,
      brand_name: true,
      company_name: true,
      dosage_form: true,
      formula: true,
      mrp: true,
      pack_size: true,
      reg_no: true,
    },
    // skip: (page - 1) * pageSize, // Calculate number of records to skip
    // take: pageSize, // Number of records to fetch
  });

  res.send({ data: medicines, search: searchQuery });
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
      const extractedText: string[] = [];

      if (data.Blocks) {
        data.Blocks.forEach((block) => {
          if (block.BlockType === "LINE" && block.Text) {
            console.log(block.Text);
            extractedText.push(block.Text);
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
    const brandNames: string[] = req.body.brandNames;

    if (!brandNames || brandNames.length === 0) {
      return res.status(400).json({ message: "No brand names provided" });
    }

    const searchResults = await searchBrandFormulations(brandNames);
    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ message: "Error searching for medicines", error });
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
      skip: (page - 1) * pageSize, // Calculate number of records to skip
      take: pageSize, // Number of records to fetch
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
      },
    });

    // Send response
    return res.status(200).send({
      data: medicines,
      pagination,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

const searchBrandFormulations = async (brandNames: string[]) => {
  const searchResults = await Promise.all(
    brandNames.map(async (brandName) => {
      // Find all unique formulations for this brand name
      const formulations = await prisma.medicineDetails.findMany({
        where: {
          brand_name: {
            contains: brandName,
          },
        },
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
      for (let formulation of uniqueFormulations) {
        const brands = await prisma.medicineDetails.findMany({
          where: {
            formulation: formulation,
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
