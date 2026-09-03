import "dotenv/config";
import express from "express";
import cors from "cors";

import reviewRoutes from "./routes/reviews.js";
import testimonialRoutes from "./routes/testimonials.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/reviews", reviewRoutes);
app.use("/api/testimonials", testimonialRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CleanSpaces backend running on port ${PORT}`);
});
