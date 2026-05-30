import express from "express";
import { isAuthenticate } from "../../middleware/isAuthenticate";
import UserController from "./controller";

const userRoutes = express.Router();

userRoutes.get("/me", isAuthenticate, UserController.getMe);

export default userRoutes;
