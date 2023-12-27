import express from "express";

import medicineRoutes from "./routes/medicine";
import authRoutes from "./routes/auth";
import pharmacistRoutes from "./routes/pharmacist";

import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(`could not connect to db ${err}`));

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/", medicineRoutes);
app.use("/", pharmacistRoutes);

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`app is listening to port ${port}`);
});
