import express from "express";
import { generateQuiz } from "../agents/quizAgent.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { document_id } = req.body;
    const quiz = await generateQuiz(document_id);
    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

export default router;
