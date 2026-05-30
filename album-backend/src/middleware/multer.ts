import fs from "fs";
import { randomUUID } from "crypto";
import multer from "multer";

const tempPath = "uploads/temp";

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempPath),
  // req.body fields are NOT available here (multipart parsing is still in progress),
  // so we use a random temp name. The controller will rename it to the correct path.
  filename: (req, file, cb) => {
    cb(null, `tmp-${randomUUID()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB per chunk
});

export default upload;
