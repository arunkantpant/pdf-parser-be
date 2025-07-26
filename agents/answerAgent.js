import OpenAI from "openai";
import { supabase } from "../utils/supabaseClient.js";
import { retrieveRelevantChunks } from "./retrievalAgent.js";
import { openaiApiKey } from "../utils/config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export async function askDomainExpert(question, documentId) {
  const { data: doc } = await supabase
    .from("documents")
    .select("domains")
    .eq("id", documentId)
    .single();

  const domain = doc?.domain || "general";

  const context = await retrieveRelevantChunks(question, documentId);

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a specialist in the domain of "${domain}". Answer the user's question based only on the given document context.`,
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
    max_tokens: 500,
  });

  return result.choices[0].message.content.trim();
}
