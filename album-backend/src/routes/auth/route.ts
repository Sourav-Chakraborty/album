import express from "express";
import { isAuthenticate } from "../../middleware/isAuthenticate";
import AuthController from "./controller";

const authRoutes = express.Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.post("/logout", isAuthenticate, AuthController.logout);

export default authRoutes;
