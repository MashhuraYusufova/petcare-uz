import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";

import authRouter from "./routes/auth";
import vetsRouter from "./routes/vets";
import productsRouter from "./routes/products";
import articlesRouter from "./routes/articles";
import petsRouter from "./routes/pets";
import appointmentsRouter from "./routes/appointments";
import wishlistRouter from "./routes/wishlist";
import dashboardRouter from "./routes/dashboard";
import adminRouter from "./routes/admin";
import vetDashboardRouter from "./routes/vet-dashboard";
import cartRouter from "./routes/cart";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/vets", vetsRouter);
app.use("/api/products", productsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/pets", petsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);
app.use("/api/vet", vetDashboardRouter);
app.use("/api/cart", cartRouter);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.user.findFirst();
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
