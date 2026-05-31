import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import AuthRoutes from "./routes/auth/route";
import fileUploadRoutes from "./routes/fileUpload/route";
import userRoutes from "./routes/user/route";

const app = express();

const port = process.env.PORT;

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("uploads"));

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/file", fileUploadRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
