import { Agent, run, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import { supabase } from "../utils/supabaseClient.js";
import { retrieveRelevantChunks } from "./retrievalAgent.js";
import { openaiApiKey } from "../utils/config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const getContextTool = tool({
  name: "get_context",
  description: "Fetch the domain and context chunks for a document question.",
  parameters: z.object({
    question: z.string(),
    document_id: z.string(),
  }),
  execute: async ({ question, document_id }) => {
    const { data: doc, error } = await supabase
      .from("documents")
      .select("domain")
      .eq("id", document_id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    const domain = doc?.domain || "general";

    const context = await retrieveRelevantChunks(question, document_id);

    return {
      name: "context_payload",
      content: `Domain: ${domain}\nContext:\n${context}`,
    };
  },
});

export const answerAgent = new Agent({
  name: "answer-agent",
  instructions: `
You are a subject matter expert answering questions about a document.
Always use the context and domain provided by the tool before answering.`,
  model: "gpt-3.5-turbo",
  tools: [getContextTool],
  openai,
});

export async function askDomainExpert(question, documentId) {
  const result = await run(answerAgent, {
    question: question,
    document_id: documentId,
  });

  return result.finalOutput?.trim();
}

// export async function askDomainExpert(question, documentId) {
//   const { data: doc } = await supabase
//     .from("documents")
//     .select("domains")
//     .eq("id", documentId)
//     .single();

//   const domain = doc?.domain || "general";

//   const context = await retrieveRelevantChunks(question, documentId);

//   const result = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "system",
//         content: `You are a specialist in the domain of "${domain}". Answer the user's question based only on the given document context.`,
//       },
//       {
//         role: "user",
//         content: `Context:\n${context}\n\nQuestion: ${question}`,
//       },
//     ],
//     max_tokens: 500,
//   });

//   return result.choices[0].message.content.trim();
// }
