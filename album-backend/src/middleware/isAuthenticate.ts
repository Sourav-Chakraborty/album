import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

declare module "express-serve-static-core" {
  export interface Request {
    user: Omit<User, "password">;
  }
}

export const isAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: +decoded.id },
      include: { medias: { select: { id: true, name: true } } },
      omit: { password: true },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    req.user = user!;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
