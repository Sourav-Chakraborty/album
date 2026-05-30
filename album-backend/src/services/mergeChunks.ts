import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

const mergeFileChunks = async ({
  uploadId,
  totalChunks,
  extension,
}: {
  uploadId: string;
  totalChunks: number;
  extension: string;
}) => {
  const chunkDir = path.join("uploads/temp", uploadId);

  const mergedDir = path.join("uploads/merged");

  // create merged directory
  if (!fs.existsSync(mergedDir)) {
    fs.mkdirSync(mergedDir, {
      recursive: true,
    });
  }

  const mergedFilePath = path.join(mergedDir, `${uploadId}.${extension}`);

  const writeStream = fs.createWriteStream(mergedFilePath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunkDir, `chunk-${i}`);

    const readStream = fs.createReadStream(chunkPath);

    await pipeline(readStream, writeStream, {
      end: false,
    });
    // delete chunk after merging
    fs.unlinkSync(chunkPath);
  }

  fs.rmSync(chunkDir, {
    recursive: true,
    force: true,
  });

  return mergedFilePath;
};

export default mergeFileChunks;
