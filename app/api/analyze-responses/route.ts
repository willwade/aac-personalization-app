import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || "openai"; // "openai" or "gemini"

export async function POST(req: Request) {
  try {
    const { responses, partners } = await req.json()

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json({ error: "No responses provided for analysis" }, { status: 400 })
    }

    // Debug logging
    console.log("LLM_PROVIDER:", LLM_PROVIDER);
    console.log("OPENAI_API_KEY exists:", !!OPENAI_API_KEY);
    console.log("GEMINI_API_KEY exists:", !!GEMINI_API_KEY);

    // Fallback: static analysis for demo
    if ((LLM_PROVIDER === "openai" && !OPENAI_API_KEY) || (LLM_PROVIDER === "gemini" && !GEMINI_API_KEY)) {
      console.log("No API key available, using demo fallback");
      return NextResponse.json({
        personalProfile: {
          name: "Demo User",
          interests: ["Technology", "Music"],
          preferences: ["Visual communication", "Routine-based interactions"]
        },
        knowledgeGraph: {
          entities: [
            { type: "person", name: "Family Member", relationship: "family", context: "daily communication" },
            { type: "place", name: "Home", context: "primary environment" },
            { type: "topic", name: "Hobbies", context: "personal interests" }
          ],
          relationships: [
            { from: "Demo User", to: "Family Member", type: "communicates_with", frequency: "daily" }
          ]
        },
        communicationContext: {
          primaryEnvironments: ["Home", "School"],
          communicationMethods: ["Visual aids", "Gestures"],
          socialCircles: ["Family", "Caregivers"]
        },
        knowledgeGaps: [
          "Need more details about specific interests",
          "Communication preferences in different environments",
          "Preferred topics for conversation starters"
        ],
        passportContent: {
          greeting: "Hello! I enjoy communicating about my interests.",
          aboutMe: "I prefer visual communication and routine interactions.",
          communicationTips: "I respond well to clear, simple communication."
        }
      }, { status: 200 });
    }

    // Format the responses for the AI
    const formattedResponses = Object.entries(responses)
      .map(([questionId, answer]) => {
        return `Question ${questionId}: ${answer}`
      })
      .join("\n\n")

    // Format partner data
    const formattedPartners = partners && partners.length > 0
      ? partners.map(p => `${p.name} (${p.role}) - Circle ${p.circle}, ${p.communicationFrequency || 'frequency unknown'}, Topics: ${p.commonTopics?.join(', ') || 'none specified'}`).join('\n')
      : "No detailed partner information available";

    const prompt = `You are an expert in building knowledge graphs for AAC (Augmentative and Alternative Communication) personalization.

Your goal is to analyze questionnaire responses and communication partner data to build a comprehensive knowledge graph that will enable better AAC personalization. Focus on extracting personal context, relationships, and identifying knowledge gaps - NOT clinical assessment.

QUESTIONNAIRE RESPONSES:
${formattedResponses}

COMMUNICATION PARTNERS:
${formattedPartners}

Based on this data, build a knowledge graph focused on:

1. PERSONAL_PROFILE: Extract the individual's name, core interests, preferences, and personal characteristics
2. KNOWLEDGE_GRAPH: Identify entities (people, places, topics) and their relationships for AAC context
3. COMMUNICATION_CONTEXT: Map communication environments, methods, and social circles
4. KNOWLEDGE_GAPS: Identify missing information that would improve AAC personalization
5. PASSPORT_CONTENT: Generate content for a communication passport (greeting, about me, communication tips)

This is for AAC PERSONALIZATION and KNOWLEDGE GRAPH BUILDING, not clinical assessment.

Format your response as JSON:
{
  "personalProfile": {
    "name": "extracted name or 'Not specified'",
    "interests": ["interest1", "interest2"],
    "preferences": ["preference1", "preference2"]
  },
  "knowledgeGraph": {
    "entities": [
      {"type": "person|place|topic", "name": "entity name", "relationship": "relationship type", "context": "context info"}
    ],
    "relationships": [
      {"from": "entity1", "to": "entity2", "type": "relationship_type", "frequency": "frequency if applicable"}
    ]
  },
  "communicationContext": {
    "primaryEnvironments": ["environment1", "environment2"],
    "communicationMethods": ["method1", "method2"],
    "socialCircles": ["circle1", "circle2"]
  },
  "knowledgeGaps": [
    "gap1: what specific information is missing",
    "gap2: what would improve personalization"
  ],
  "passportContent": {
    "greeting": "A personal greeting/introduction",
    "aboutMe": "Key personal information",
    "communicationTips": "How others can best communicate with this person"
  }
}`;

    // Provider switch
    let llm;
    if (LLM_PROVIDER === "gemini") {
      console.log("Using Gemini provider");
      llm = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY!,
        model: "gemini-1.5-flash",
        maxOutputTokens: 2000,
        temperature: 0.3,
      });
    } else {
      console.log("Using OpenAI provider");
      llm = new ChatOpenAI({
        apiKey: OPENAI_API_KEY!,
        modelName: "gpt-4o",
        maxTokens: 1000,
        temperature: 0.3,
      });
    }

    const response = await llm.invoke([
      { role: "system", content: "You are an expert in AAC and communication analysis. Always respond with valid JSON." },
      { role: "user", content: prompt },
    ]);

    // Log the raw LLM response for debugging
    console.log("Raw LLM response:", response);
    console.log("Raw LLM response.content:", response.content);

    // Extract JSON from LangChain response.content
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
        return NextResponse.json(parsed, { status: 200 });
      } catch (err) {
        console.error("Failed to parse JSON from model response:", err, jsonString);
        return NextResponse.json({ error: "Failed to parse JSON from LLM response", raw: jsonString }, { status: 500 });
      }
    } else {
      // No valid JSON found in LLM response.content
      return NextResponse.json({ error: "No JSON found in LLM response", raw: response.content }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in analyze-responses API:", error)

    // Check if it's a quota/rate limit error and provide fallback
    if (typeof error === "object" && error !== null && "message" in error) {
      const errorMessage = (error as any).message;
      if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        console.log("API quota exceeded, using fallback response");
        return NextResponse.json({
          personalProfile: {
            name: "User",
            interests: ["Daily activities", "Communication"],
            preferences: ["Visual aids", "Routine interactions"]
          },
          knowledgeGraph: {
            entities: [
              { type: "person", name: "Family Member", relationship: "family", context: "daily communication" },
              { type: "place", name: "Home", context: "primary environment" }
            ],
            relationships: [
              { from: "User", to: "Family Member", type: "communicates_with", frequency: "daily" }
            ]
          },
          communicationContext: {
            primaryEnvironments: ["Home"],
            communicationMethods: ["Visual aids"],
            socialCircles: ["Family"]
          },
          knowledgeGaps: [
            "Need more specific interest details",
            "Communication preferences in different settings"
          ],
          passportContent: {
            greeting: "Hello! I enjoy communicating with my family and friends.",
            aboutMe: "I prefer clear, simple communication.",
            communicationTips: "Please be patient and use visual supports when possible."
          },
          error: "API quota exceeded. Using demo fallback."
        }, { status: 200 });
      }
      return NextResponse.json({ error: "An error occurred", details: errorMessage }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to analyze responses" }, { status: 500 })
  }
}
