import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import textract from "../libs/extrator";

const prisma = new PrismaClient();

const getFindBy = async (req: Request, res: Response) => {
    const searchCriteria = req.query.searchCriteria;
    const searchQuery = req.query.searchQuery;

    if (
        !["company_name", "brand_name", "formulation"].includes(
            searchCriteria as unknown as string
        )
    ) {
        return res.status(400).json({ error: "Invalid searchCriteria" });
    }
    const medicines = await prisma.medicineDetails.findMany({
        where: {
            [searchCriteria as unknown as string]: {
                contains: searchQuery,
            },
        },
        select: {
            id:true,
            brand_name: true,
            company_name: true,
            dosage_form: true,
            formulation: true,
            mrp: true,
            pack_size: true,
            reg_no: true,
        },
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
            const extractedText:string[] = [];

            if (data.Blocks) {
                data.Blocks.forEach(block => {
                    if (block.BlockType === 'LINE' && block.Text) {
                        console.log(block.Text);
                        extractedText.push(block.Text);
                    }
                });
            };
            if(extractedText.length === 0) res.send('No result found');
            try {
                const result = await searchBrandList(extractedText);
               return res.status(200).send(result)
            } catch (error) {
                console.log(error);
                return res.status(500).send('Server Error');
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

        const searchResults = await searchBrandList(brandNames);

        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ message: "Error searching for medicines", error });
    }
};

const searchBrandList = async (brandNames: string[]) => {
    const searchResults = await Promise.all(
        brandNames.map(async (brandName) => {
            const result = await prisma.medicineDetails.findMany({
                where: {
                    brand_name: {
                        contains: brandName,
                    },
                },
                select: {
                    id:true,
                    brand_name: true,
                    company_name: true,
                    dosage_form: true,
                    formulation: true,
                    mrp: true,
                    pack_size: true,
                    reg_no: true,
                },
            });
            return { brandName, brands: result };
        })
    );
    return searchResults
}
export { getFindBy, uploadPrescription, searchPrescription };
