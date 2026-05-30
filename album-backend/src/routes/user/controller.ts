import { Request, Response } from "express";

export default class UserController {
  public static async getMe(req: Request, res: Response) {
    return res.status(200).json({ message: "user found", user: req.user });
  }
}
