import express from "express";
import multer from "multer";
import { supabase } from "../utils/supabaseClient.js";
import { processPdf } from "../utils/pdfProcessor.js";
import { classifyDocument } from "../agents/classifierAgent.js";

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
    const domain = await classifyDocument(text);

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
