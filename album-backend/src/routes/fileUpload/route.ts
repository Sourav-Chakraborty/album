import { Router } from "express";
import { isAuthenticate } from "../../middleware/isAuthenticate";
import upload from "../../middleware/multer";
import FileUploadController from "./controller";

const fileUploadRoutes = Router();

fileUploadRoutes.post(
  "/chunk",
  upload.single("chunk"),
  isAuthenticate,
  FileUploadController.uploadFileChunk,
);
fileUploadRoutes.post(
  "/upload",
  isAuthenticate,
  FileUploadController.mergeFile,
);

export default fileUploadRoutes;
