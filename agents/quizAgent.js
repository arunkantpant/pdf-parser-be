import OpenAI from "openai";
import { supabase } from "../utils/supabaseClient.js";
import { retrieveRelevantChunks } from "./retrievalAgent.js";
import { openaiApiKey } from "../utils/config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export async function generateQuiz(documentId) {
  const { data: doc } = await supabase
    .from("documents")
    .select("domain")
    .eq("id", documentId)
    .single();

  const domain = doc?.domain || "general";

  const context = await retrieveRelevantChunks(
    "generate revision questions",
    documentId
  );

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert educator in the domain of "${domain}". Generate 5 high-quality revision questions from the document. Include a mix of:
- 2 multiple choice questions
- 2 true/false questions
- 1 short answer

Format your response clearly.`,
      },
      {
        role: "user",
        content: `Context:\n${context}`,
      },
    ],
  });

  return result.choices[0].message.content.trim();
}
