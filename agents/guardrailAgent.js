import OpenAI from "openai";
import { openaiApiKey } from "../utils/config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export async function guardPrompt(prompt, domain) {
  const systemPrompt = `
You are a moderation agent. Given a user's question and the topic domain of a document, your job is to decide if the question is:
- abusive
- inappropriate
- completely unrelated to the document domain

You must return ONLY one of the following strings:
- "allow"
- "block: abusive"
- "block: off-topic"
- "block: inappropriate"
`;

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Domain: ${domain}\nQuestion: ${prompt}`,
      },
    ],
    max_tokens: 50,
  });

  const decision = result.choices[0].message.content.trim().toLowerCase();
  return decision;
}
