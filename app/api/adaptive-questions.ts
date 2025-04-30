import type { NextApiRequest, NextApiResponse } from "next";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai"; // "openai" or "gemini"

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  // Fallback: static adaptive question and suggestions for demo
  if ((LLM_PROVIDER === "openai" && !OPENAI_API_KEY) || (LLM_PROVIDER === "gemini" && !GEMINI_API_KEY)) {
    return res.status(200).json({
      question: "[DEMO] What is one goal you have for improving communication?",
      suggestedAnswers: [
        "Initiate more conversations",
        "Express feelings independently",
        "Participate in group activities"
      ],
      error: "No LLM API key set. Using demo fallback."
    });
  }

  const { previousQuestions, previousAnswers, currentQuestionText } = req.body;

  try {
    const prompt = `Given the following questionnaire context for an AAC user, suggest the next most relevant question and 3 suggested answers.\n\nPrevious questions: ${JSON.stringify(previousQuestions)}\nPrevious answers: ${JSON.stringify(previousAnswers)}\nCurrent question: ${currentQuestionText}\n\nRespond in JSON with { question, suggestedAnswers }.`;

    // Provider switch
    let llm;
    if (LLM_PROVIDER === "gemini") {
      llm = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY!,
        model: "gemini-pro",
        maxOutputTokens: 300,
        temperature: 0.7,
      });
    } else {
      llm = new ChatOpenAI({
        apiKey: OPENAI_API_KEY!,
        modelName: "gpt-4o", // or "gpt-4" if you prefer
        maxTokens: 300,
        temperature: 0.7,
      });
    }

    const response = await llm.invoke([
      { role: "system", content: "You are an expert in AAC and adaptive communication assessment." },
      { role: "user", content: prompt },
    ]);

    // Log the raw LLM response for debugging
    console.log("Raw LLM response:", response);
    console.log("Raw LLM response.content:", response.content);

    // Strictly extract JSON from response.content only
    let jsonString = "";
    if (typeof response.content === "string") {
      // Try to extract a code block
      const codeBlockMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1];
      } else {
        // Try to find the first {...} block
        const curlyBlockMatch = response.content.match(/({[\s\S]*})/);
        if (curlyBlockMatch && curlyBlockMatch[1]) {
          jsonString = curlyBlockMatch[1];
        }
      }
    }

    if (jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        // Only return the parsed object (question & suggestedAnswers)
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(parsed);
      } catch (err) {
        console.error("Failed to parse JSON from model response:", err, jsonString);
        return res.status(500).json({ error: "Failed to parse JSON from LLM response", raw: jsonString });
      }
    } else {
      // No valid JSON found in LLM response.content
      return res.status(500).json({ error: "No JSON found in LLM response", raw: response.content });
    }
      }),
    })

    // Log status and headers
    console.log('OpenAI API status:', completionRes.status)
    console.log('OpenAI API headers:', Object.fromEntries(completionRes.headers.entries()))
    // Clone the response to read the body as text for logging
    const completionResClone = completionRes.clone();
    const bodyText = await completionResClone.text();
    console.log('OpenAI API body (raw text):', bodyText);

    if (!completionRes.ok) {
      return res.status(500).json({ error: "OpenAI API error", details: bodyText })
    }

    // Try to handle both string and object responses robustly
    let parsed;
    let jsonString = '';
    let data: any = bodyText;
    // If bodyText is a string, try to parse as JSON
    if (typeof bodyText === 'string') {
      try {
        data = JSON.parse(bodyText);
      } catch (e) {
        // leave as string
      }
    }
    // Log the raw OpenAI response and parsed data
    console.log('RAW OpenAI API response (bodyText):', bodyText);
    console.log('PARSED OpenAI API response (data):', data);
    console.log('AI response data type:', Array.isArray(data) ? 'array' : typeof data, data);

    // 1. If the response is an array, join and parse
    if (Array.isArray(data)) {
      const concatenated = data.join('');
      let jsonString = '';
      const codeBlockMatch = concatenated.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        const curlyBlockMatch = concatenated.match(/({[\s\S]*})/);
        if (curlyBlockMatch) {
          jsonString = curlyBlockMatch[1];
        }
      }
      if (jsonString) {
        try {
          parsed = JSON.parse(jsonString);
          res.setHeader('Content-Type', 'application/json');
          return res.status(200).json(parsed);
        } catch (err) {
          console.error('Failed to parse JSON from array-concatenated response:', err, jsonString);
          return res.status(500).json({ error: 'Failed to parse JSON from AI response', raw: jsonString });
        }
      } else {
        return res.status(500).json({ error: 'No JSON found in AI response', raw: concatenated });
      }
    }

    // 2. If data is an object with numbered keys (Vercel AI SDK style)
    if (data && typeof data === 'object') {
      const numberedKeys = Object.keys(data)
        .filter(k => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b));
      if (numberedKeys.length > 0) {
        const concatenated = numberedKeys.map(k => data[k]).join('');
        let jsonString = '';
        const codeBlockMatch = concatenated.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          const curlyBlockMatch = concatenated.match(/({[\s\S]*})/);
          if (curlyBlockMatch) {
            jsonString = curlyBlockMatch[1];
          }
        }
        if (jsonString) {
          try {
            parsed = JSON.parse(jsonString);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(parsed);
          } catch (err) {
            console.error('Failed to parse JSON from concatenated numbered keys:', err, jsonString);
            return res.status(500).json({ error: 'Failed to parse JSON from AI response', raw: jsonString });
          }
        } else {
          return res.status(500).json({ error: 'No JSON found in AI response', raw: concatenated });
        }
      }
      // 3. Check for nested content (common with AI SDKs)
      if (typeof data.content === 'string') {
        // Try to extract JSON from content
        let jsonString = '';
        const codeBlockMatch = data.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          const curlyBlockMatch = data.content.match(/({[\s\S]*})/);
          if (curlyBlockMatch) {
            jsonString = curlyBlockMatch[1];
          }
        }
        if (jsonString) {
          try {
            parsed = JSON.parse(jsonString);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(parsed);
          } catch (err) {
            console.error('Failed to parse JSON from data.content:', err, jsonString);
            return res.status(500).json({ error: 'Failed to parse JSON from AI response', raw: jsonString });
          }
        }
      }
      if (typeof data.message === 'string') {
        // Try to extract JSON from message
        let jsonString = '';
        const codeBlockMatch = data.message.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          const curlyBlockMatch = data.message.match(/({[\s\S]*})/);
          if (curlyBlockMatch) {
            jsonString = curlyBlockMatch[1];
          }
        }
        if (jsonString) {
          try {
            parsed = JSON.parse(jsonString);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(parsed);
          } catch (err) {
            console.error('Failed to parse JSON from data.message:', err, jsonString);
            return res.status(500).json({ error: 'Failed to parse JSON from AI response', raw: jsonString });
          }
        }
      }
      if (Array.isArray(data.choices) && data.choices.length > 0 && typeof data.choices[0].message?.content === 'string') {
        // Try to extract JSON from choices[0].message.content
        let jsonString = '';
        const codeBlockMatch = data.choices[0].message.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          const curlyBlockMatch = data.choices[0].message.content.match(/({[\s\S]*})/);
          if (curlyBlockMatch) {
            jsonString = curlyBlockMatch[1];
          }
        }
        if (jsonString) {
          try {
            parsed = JSON.parse(jsonString);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(parsed);
          } catch (err) {
            console.error('Failed to parse JSON from choices[0].message.content:', err, jsonString);
            return res.status(500).json({ error: 'Failed to parse JSON from AI response', raw: jsonString });
          }
        }
      }
    }

    // If data is an object with numbered keys (Vercel AI SDK style)
    if (data && typeof data === 'object') {
      const numberedKeys = Object.keys(data)
        .filter(k => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b));
      if (numberedKeys.length > 0) {
        const concatenated = numberedKeys.map(k => data[k]).join('');
        let jsonString = '';
        const codeBlockMatch = concatenated.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          const curlyBlockMatch = concatenated.match(/({[\s\S]*})/);
          if (curlyBlockMatch) {
            jsonString = curlyBlockMatch[1];
          }
        }
        if (jsonString) {
          try {
            parsed = JSON.parse(jsonString);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(parsed);
          } catch (err) {
            console.error('Failed to parse JSON from concatenated numbered keys:', err, jsonString);
            return res.status(500).json({ error: 'Failed to parse JSON from AI response', raw: jsonString });
          }
        } else {
          return res.status(500).json({ error: 'No JSON found in AI response', raw: concatenated });
        }
      }
    }
    // If data is a string, try to extract code block or curly braces
    if (typeof data === 'string') {
      const codeBlockMatch = data.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
        try {
          parsed = JSON.parse(jsonString);
        } catch (err) {
          console.error('Failed to parse JSON from code block:', err, jsonString);
          parsed = { question: jsonString, suggestedAnswers: [] };
        }
      } else {
        const curlyBlockMatch = data.match(/({[\s\S]*})/);
        if (curlyBlockMatch) {
          jsonString = curlyBlockMatch[1];
          try {
            parsed = JSON.parse(jsonString);
          } catch (err2) {
            console.error('Failed to parse JSON from curly braces:', err2, jsonString);
            parsed = { question: jsonString, suggestedAnswers: [] };
          }
        } else {
          parsed = { question: data, suggestedAnswers: [] };
        }
      }
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(parsed);
    }
    // Fallback: return whatever data is
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (e) {
    console.error('Unexpected error in /api/adaptive-questions:', e)
    if (typeof e === 'object' && e !== null && 'message' in e) {
      return res.status(500).json({ error: "An unknown error occurred (outer catch)", details: e.message })
    }
    return res.status(500).json({ error: "An unknown error occurred (outer catch)", details: e })
  }
  } catch (e) {
    console.error('Unexpected error in /api/adaptive-questions:', e)
    if (typeof e === 'object' && e !== null && 'message' in e) {
      return res.status(500).json({ error: "An unknown error occurred (outer catch)", details: e.message })
    }
    return res.status(500).json({ error: "An unknown error occurred (outer catch)", details: e })
  }
}
