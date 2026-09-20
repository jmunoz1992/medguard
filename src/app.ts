import express from "express";
import { healthRouter } from "./routes/health.js";
import checkInteractionRouter from "./routes/checkInteraction.js";

export const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(checkInteractionRouter);
