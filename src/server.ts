import "dotenv/config";
import express from "express";
import checkInteractionRouter from "./routes/checkInteraction.ts";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(checkInteractionRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});