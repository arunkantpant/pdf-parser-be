import express from "express";
import multer from "multer";
import { supabase } from "../utils/supabaseClient.js";
import { processPdf } from "../utils/pdfProcessor.js";
import { classifierAgent } from "../agents/classifierAgent.js";
import { run } from "@openai/agents";

const upload = multer();
const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { user_id, title } = req.body;

    const { data: docData, error: docError } = await supabase
      .from("documents")
      .insert([
        {
          user_id,
          title,
        },
      ])
      .select()
      .single();

    console.log("Document inserted:", docData);
    console.log("Document error:", docError);

    const documentId = docData.id;

    const { chunks, text } = await processPdf(req.file.buffer, documentId);

    const classificationResult = await run(
      classifierAgent,
      text.slice(0, 3000)
    );
    const domain = classificationResult.finalOutput.trim();

    await supabase.from("documents").update({ domain }).eq("id", documentId);

    res.json({
      message: "PDF processed",
      document_id: documentId,
      chunks,
      domain,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
