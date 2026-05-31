import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

export default class AuthController {
  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({ message: "login success" });
  }

  public static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return res
      .status(201)
      .json({ message: "user created successfully,Please login" });
  }

  public static async logout(req: Request, res: Response) {
    res.clearCookie("authToken");
    return res.status(200).json({ message: "logout success" });
  }
}
