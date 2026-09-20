import { Router } from "express";
import { z } from "zod";
import { assessRisk } from "../services/claudeAgent.ts";

const router = Router();
const bodySchema = z.object({
  currentMeds: z.array(z.string()).min(1),
  newDrug: z.string().min(1)
});

router.post("/check-interaction", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const assessment = await assessRisk(parsed.data.currentMeds, parsed.data.newDrug);
    res.json({ assessment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assess risk" });
  }
});

export default router;