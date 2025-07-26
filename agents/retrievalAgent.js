import OpenAI from "openai";
import { supabase } from "../utils/supabaseClient.js";
import { openaiApiKey } from "../utils/config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export async function retrieveRelevantChunks(query, documentId) {
  const { data: chunks } = await supabase
    .from("document_chunks")
    .select("content, embedding")
    .eq("document_id", documentId);

  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });

  const queryVec = queryEmbedding.data[0].embedding;

  const results = chunks.map((chunk) => {
    const chunkEmbedding =
      typeof chunk.embedding === "string"
        ? chunk.embedding.replace(/[()]/g, "").split(",").map(Number)
        : chunk.embedding;

    return {
      text: chunk.content,
      score: cosineSimilarity(queryVec, chunkEmbedding),
    };
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.text)
    .join("\n---\n");
}
