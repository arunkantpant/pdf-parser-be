import express from "express";
import { askDomainExpert } from "../agents/answerAgent.js";
import { guardPrompt } from "../agents/guardrailAgent.js";
import { supabase } from "../utils/supabaseClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question, document_id } = req.body;

    const { data: doc } = await supabase
      .from("documents")
      .select("domain")
      .eq("id", document_id)
      .single();

    const domain = doc?.domain || "general";

    const decision = await guardPrompt(question, domain);

    if (decision.startsWith("block")) {
      return res.status(403).json({
        blocked: true,
        reason: decision,
        message: "Your question was blocked by moderation.",
      });
    }

    const answer = await askDomainExpert(question, document_id);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get answer" });
  }
});

export default router;
