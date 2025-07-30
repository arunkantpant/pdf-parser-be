import pdfParse from "pdf-parse/lib/pdf-parse.js";
import OpenAI from "openai";
import { supabase } from "./supabaseClient.js";
import { openaiApiKey } from "./config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

function splitText(text, maxLen = 1000) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const chunks = [];
  let chunk = "";

  sentences.forEach((sentence) => {
    if ((chunk + sentence).length > maxLen) {
      chunks.push(chunk);
      chunk = sentence;
    } else {
      chunk += sentence;
    }
  });

  if (chunk) {
    chunks.push(chunk);
  }

  return chunks;
}

export async function processPdf(fileBuffer, documentId) {
  const parsed = await pdfParse(fileBuffer);
  const chunks = splitText(parsed.text);

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];

    // Skip empty or whitespace-only chunks
    if (!chunk.trim()) continue;

    try {
      const response = await openai.embeddings.create({
        input: chunk,
        model: "text-embedding-ada-002",
      });

      const embedding = response?.data?.[0]?.embedding;
      if (!embedding) {
        console.warn(`No embedding returned for chunk index ${index}`);
        continue;
      }

      await supabase.from("document_chunks").insert({
        document_id: documentId,
        content: chunk,
        embedding,
        chunk_index: index,
      });
    } catch (err) {
      console.error(`Error processing chunk ${index}:`, err);
    }
  }

  return { chunks: chunks.length, text: parsed.text };
}
