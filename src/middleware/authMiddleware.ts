import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.headers.authorization;
  if (!authToken) return res.status(400).send({ message: "token required" });
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || "");
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid or expired token" });
  }
};

const isPharmacist = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.user && req.user.type === "pharmacist") {
    next(); // User is a pharmacist, proceed to the next handler
  } else {
    return res
      .status(403)
      .json({ message: "Access denied: User is not a pharmacist" });
  }
};

export { authMiddleware, isPharmacist };
