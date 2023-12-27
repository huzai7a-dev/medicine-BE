import express from "express";
import { login, signUp } from "../controllers/auth";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
export default router;
