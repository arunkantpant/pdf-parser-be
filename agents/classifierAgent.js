import OpenAI from "openai";
import { openaiApiKey } from "../utils/config.js";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export async function classifyDocument(text) {
  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You're an expert classifier. Based on the content of a document, output only the domain/subject.
Examples: "Finance", "Law", "Biology", "Public Policy", "Medicine", "Computer Science", etc.`,
      },
      {
        role: "user",
        content: `Here is the document:\n\n${text.slice(0, 3000)}`,
      },
    ],
  });

  return result.choices[0].message.content.trim();
}
