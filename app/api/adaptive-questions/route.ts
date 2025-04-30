import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai"; // "openai" or "gemini"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { previousQuestions, previousAnswers, currentQuestionText } = body;

    // Fallback: static adaptive question and suggestions for demo
    if ((LLM_PROVIDER === "openai" && !OPENAI_API_KEY) || (LLM_PROVIDER === "gemini" && !GEMINI_API_KEY)) {
      return NextResponse.json({
        question: "[DEMO] What is one goal you have for improving communication?",
        suggestedAnswers: [
          "Initiate more conversations",
          "Express feelings independently",
          "Participate in group activities"
        ],
        error: "No LLM API key set. Using demo fallback."
      }, { status: 200 });
    }

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
        modelName: "gpt-4o",
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
        return NextResponse.json(parsed, { status: 200 });
      } catch (err) {
        console.error("Failed to parse JSON from model response:", err, jsonString);
        return NextResponse.json({ error: "Failed to parse JSON from LLM response", raw: jsonString }, { status: 500 });
      }
    } else {
      // No valid JSON found in LLM response.content
      return NextResponse.json({ error: "No JSON found in LLM response", raw: response.content }, { status: 500 });
    }
  } catch (e) {
    console.error("Unexpected error in /api/adaptive-questions:", e);
    if (typeof e === "object" && e !== null && "message" in e) {
      return NextResponse.json({ error: "An unknown error occurred (outer catch)", details: (e as any).message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred (outer catch)", details: e }, { status: 500 });
  }
}
