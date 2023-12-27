import express from "express";

import { authMiddleware, isPharmacist } from "../middleware/authMiddleware";
import {
  deleteMedicine,
  getFullMedicines,
  updateMedicine,
} from "../controllers/pharmacist";

const router = express.Router();

router.get(
  "/get-full-medicines",
  [authMiddleware, isPharmacist],
  getFullMedicines
);

router.post("/medicine/:id", [authMiddleware, isPharmacist], updateMedicine);
router.delete("/medicine/:id", [authMiddleware, isPharmacist], deleteMedicine);

export default router;
