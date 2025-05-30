import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai"; // "openai" or "gemini"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { previousQuestions, previousAnswers, currentQuestionText, selectedPerson } = body;

    // Fallback: static adaptive question and suggestions for demo
    if ((LLM_PROVIDER === "openai" && !OPENAI_API_KEY) || (LLM_PROVIDER === "gemini" && !GEMINI_API_KEY)) {
      console.log("No API key available, using demo fallback");
      return NextResponse.json({
        followUpQuestion: "[DEMO] What is one goal you have for improving communication?",
        suggestedAnswers: [
          "Initiate more conversations",
          "Express feelings independently",
          "Participate in group activities"
        ]
      }, { status: 200 });
    }

    // Calculate how many adaptive questions have been generated
    const adaptiveQuestionCount = previousQuestions.filter((q: string) => q.includes('[ADAPTIVE]')).length;
    const maxAdaptiveQuestions = 8; // Limit adaptive questions

    // Check if we've reached the limit
    if (adaptiveQuestionCount >= maxAdaptiveQuestions) {
      return NextResponse.json({
        followUpQuestion: "[COMPLETE] You've completed the adaptive questionnaire! The system now has enough information to provide personalized vocabulary recommendations.",
        suggestedAnswers: [
          "Thank you for the detailed information",
          "I'm ready to see my vocabulary recommendations",
          "This was helpful for understanding my needs"
        ],
        isComplete: true
      }, { status: 200 });
    }

    // Build person context string
    let personContext = "";
    if (selectedPerson) {
      personContext = `

SELECTED COMMUNICATION PARTNER CONTEXT:
- Name: ${selectedPerson.name}
- Role/Relationship: ${selectedPerson.role || "Not specified"}
- Communication Circle: ${selectedPerson.circle ? `Circle ${selectedPerson.circle}` : "Not specified"}
- Communication Frequency: ${selectedPerson.communicationFrequency || "Not specified"}
- Communication Style: ${selectedPerson.communicationStyle || "Not specified"}
- Common Topics: ${selectedPerson.commonTopics?.join(", ") || "Not specified"}
- Notes: ${selectedPerson.notes || "Not specified"}

Use this information to ask more specific questions about their relationship and communication patterns. For example:
- If they're married, ask about how long they've been married
- If it's a family member, ask about family dynamics and shared activities
- If it's a professional relationship, ask about work-related communication needs
- Ask about specific challenges or successes in communicating with this person`;
    }

    const prompt = `Given the following questionnaire context for an AAC user, suggest the next most relevant question and 3 suggested answers. We want to know how they communicate but really we want to know about the person; their likes, dislikes, some history, pets, area, hobbies, some medical story.

IMPORTANT: This is adaptive question ${adaptiveQuestionCount + 1} of maximum ${maxAdaptiveQuestions}. ${adaptiveQuestionCount >= maxAdaptiveQuestions - 2 ? 'Focus on the MOST CRITICAL missing information for vocabulary selection.' : 'Focus on gathering rich personal details.'}
${personContext}

Previous questions: ${JSON.stringify(previousQuestions)}
Previous answers: ${JSON.stringify(previousAnswers)}
Current question: ${currentQuestionText}

Respond in JSON with { followUpQuestion, suggestedAnswers }.`;

    // Provider switch
    let llm;
    if (LLM_PROVIDER === "gemini") {
      llm = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY!,
        model: "gemini-1.5-flash",
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
      { role: "system", content: "You are an expert in AAC and adaptive communication assessment. You want to gather inormation to provide the best, most relevant vocabulary for a individual" },
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

    // Check if it's a quota/rate limit error and provide fallback
    if (typeof e === "object" && e !== null && "message" in e) {
      const errorMessage = (e as any).message;
      if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        console.log("API quota exceeded, using fallback response");
        return NextResponse.json({
          followUpQuestion: "[DEMO] What specific communication challenges would you like to work on?",
          suggestedAnswers: [
            "Starting conversations with new people",
            "Expressing complex thoughts and feelings",
            "Participating in group discussions"
          ],
          error: "API quota exceeded. Using demo fallback."
        }, { status: 200 });
      }
      return NextResponse.json({ error: "An error occurred", details: errorMessage }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred", details: String(e) }, { status: 500 });
  }
}
