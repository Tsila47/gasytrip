import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import ridesRoutes from "./routes/rides.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "https://gasytrip.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API covoiturage backend sur http://localhost:${port}`);
});