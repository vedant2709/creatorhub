import fetch from "node-fetch";
import { Config } from "../config/config.js";

export const callAI = async (prompt) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${Config.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await res.json();

  if (!data.candidates) {
    console.error("AI Error:", data);
    throw new Error("AI failed");
  }

  return data.candidates[0].content.parts[0].text;
};