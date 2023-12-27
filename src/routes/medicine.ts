import express from "express";
import multer from "multer";
import {
  getAllMedicines,
  getFindBy,
  searchPrescription,
  uploadPrescription,
} from "../controllers/medicine";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ dest: "uploads/", storage: multer.memoryStorage() });

router.get("/get-all-medicines", [authMiddleware], getAllMedicines);
router.post("/find-by", [authMiddleware], getFindBy);
router.post(
  "/upload-prescription",
  [authMiddleware],
  upload.single("image"),
  uploadPrescription
);
router.post("/search-prescription", [authMiddleware], searchPrescription);

export default router;
