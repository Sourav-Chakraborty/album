import { Request, Response } from "express";
import fs from "fs";
import { prisma } from "../../lib/prisma";
import mergeFileChunks from "../../services/mergeChunks";

export default class FileUploadController {
  public static async uploadFileChunk(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { uploadId, chunkIndex } = req.body;

    const uploadDir = `uploads/temp/${uploadId}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    const newPath = `${uploadDir}/chunk-${chunkIndex}`;

    fs.renameSync(req.file.path, newPath);

    return res.status(200).json({ message: "Chunk uploaded successfully" });
  }

  public static async mergeFile(req: Request, res: Response) {
    try {
      const { uploadId, totalChunks, extension } = req.body;

      const mergedFilePath = await mergeFileChunks({
        uploadId,
        totalChunks,
        extension,
      });
      const media = await prisma.media.create({
        data: {
          name: `${uploadId}.${extension}`,
          userId: Number(req.user.id),
        },
      });

      return res
        .status(200)
        .json({ message: "File merged successfully", mergedFilePath });
    } catch (err) {
      console.log("Error", err);
    }
  }
}
