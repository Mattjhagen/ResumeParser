// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static public files
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.use("/upload-resume", uploadRoutes);
app.use("/payment", paymentRoutes);

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
