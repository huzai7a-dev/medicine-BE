import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import textract from "../libs/extrator";
import { paginate } from "../libs/utils";

interface PrescriptionDto {
  brandName: string;
  dosageForm?: "tablet" | "capsule";
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

  if (dosageForm !== "tablet" && dosageForm !== "capsule") {
    return res.status(400).send("Invalid dosage form");
  }

  try {
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

    if (medicines.length < 1) {
      let otherDosageForm: typeof dosageForm | "" = "";
      if (dosageForm === "capsule") otherDosageForm = "tablet";
      if (dosageForm === "tablet") otherDosageForm = "capsule";

      const suggestedMedicine = await prisma.medicineDetails.findMany({
        where: {
          [searchCriteria as unknown as string]: {
            contains: searchQuery,
          },
          dosage_form: otherDosageForm,
          is_public: true,
          efficacy: { not: null },
        },
        select: {
          dosage_form: true,
        },
      });

      if (suggestedMedicine.length < 1)
        return res.send({ data: [], search: searchQuery, milligramsList: [] });
      res.send({
        data: [],
        search: searchQuery,
        suggest: {
          findBy: searchCriteria,
          hasSuggestedMedicine: true,
          dosageForm: otherDosageForm,
        },
      });
    } else {
      const milligramsList = [
        ...new Set(
          medicines.map((item) =>
            item.milligrams?.split(" ").join("").replace(",", "")
          )
        ),
      ];
      res.send({ data: medicines, search: searchQuery, milligramsList });
    }
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
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
      const brandsWithFormulation = await getBrandsWithFormulation(
        selectQuery,
        dosageForm
      );
      if (brandsWithFormulation.length === 0) {
        const alternateDosageForm: typeof dosageForm =
          dosageForm === "capsule" ? "tablet" : "capsule";
        const queryWithAlternate = {
          ...selectQuery,
          dosage_form: alternateDosageForm,
        };
        const alternateResult = await getBrandsWithFormulation(
          queryWithAlternate,
          queryWithAlternate.dosage_form
        );
        if (alternateResult.length > 0) {
          return {
            brandName,
            brands: [],
            suggestedResult: {
              brand: queryWithAlternate.brand_name.contains,
              dosageForm: queryWithAlternate.dosage_form,
            },
          };
        }
      }
      const milligramsList = [
        ...new Set(
          brandsWithFormulation.map((item) =>
            item.milligrams?.split(" ").join("").replace(",", "")
          )
        ),
      ];
      return { brandName, brands: brandsWithFormulation,milligramsList };
    })
  );
  return searchResults;
};

const getBrandsWithFormulation = async (
  selectQuery: any,
  dosageForm?: string
) => {
  const formulations = await prisma.medicineDetails.findMany({
    where: selectQuery,
    select: {
      formula: true,
    },
  });
  const uniqueFormulations = [...new Set(formulations.map((f) => f.formula))];

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

    brandsWithFormulation = brandsWithFormulation.concat(brands);
  }
  return brandsWithFormulation;
};

export { getFindBy, uploadPrescription, searchPrescription, getAllMedicines };
