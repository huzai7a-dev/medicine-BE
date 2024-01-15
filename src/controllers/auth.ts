import { Request, Response } from "express";
import { signupSchema } from "../validations/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import argon from "argon2";
import { getToken } from "../libs/utils";
const prisma = new PrismaClient();

const signUp = async (req: Request, res: Response) => {
  const { username, mobile_no, name, password, address, details, is_public } =
    req.body as typeof signupSchema._type;
  try {
    const usernameExist = await prisma.user.findUnique({
      where: { username: username },
    });
    if (usernameExist) return res.status(409).send("User name already taken");

    signupSchema.parse(req.body);
    const hashPassword = await argon.hash(password);
    const createdUser = await prisma.user.create({
      data: {
        name,
        username,
        password: hashPassword,
        mobile_no,
        address,
        details,
        is_public,
        type: is_public ? "public" : "pharmacist",
      },
      select: {
        name: true,
        username: true,
        mobile_no: true,
        address: true,
        details: true,
        is_public: true,
      },
    });
    res.status(201).send({ data: createdUser, message: "Signup successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors: formattedErrors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .send({ message: "Username and password are required" });

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user)
    return res.status(400).send({ message: "Email or password is incorrect" });

  const isValidPassword = await argon.verify(user.password || "", password);

  if (!isValidPassword)
    return res.status(400).send({ message: "Email or password is incorrect" });

  const jwtPayload = {
    id: user.id,
    name: user.name,
    username: user.username,
    type: user.type,
    is_public: user.is_public,
    address: user.address,
    details: user.details,
  };
  const token = getToken(jwtPayload);
  return res.status(200).send({
    access_token: token,
    message: "Login successful",
    data: jwtPayload,
  });
};
export { signUp, login };
