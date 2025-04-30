import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { previousQuestions, previousAnswers, currentQuestion } = await req.json()

    // Create a context from previous Q&A pairs
    const context = previousQuestions
      .map((q: string, i: number) => {
        return `Question: ${q}\nAnswer: ${previousAnswers[i] || "Not answered"}`
      })
      .join("\n\n")

    const prompt = `
You are an expert in AAC (Augmentative and Alternative Communication) and helping to build personalized communication systems.

Based on the following previous questions and answers from a caregiver about an AAC user:

${context}

The current question is: "${currentQuestion}"

Please generate:
1. A follow-up question that digs deeper into the response and helps gather more specific information about the AAC user's communication needs, preferences, and social network.
2. 2-3 suggested answer options that might help guide the caregiver if they're unsure how to respond.

Format your response as JSON with the following structure:
{
  "followUpQuestion": "Your follow-up question here",
  "suggestedAnswers": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

Make your follow-up question specific, empathetic, and focused on gathering actionable information that would help personalize an AAC system.
`

    const result = streamText({
      model: openai("gpt-4o"),
      prompt,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in adaptive questions API:", error)
    return NextResponse.json({ error: "Failed to generate adaptive questions" }, { status: 500 })
  }
}
