import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { responses } = await req.json()

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json({ error: "No responses provided for analysis" }, { status: 400 })
    }

    // Format the responses for the AI
    const formattedResponses = Object.entries(responses)
      .map(([questionId, answer]) => {
        return `Question ${questionId}: ${answer}`
      })
      .join("\n\n")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
You are an expert in AAC (Augmentative and Alternative Communication) and analyzing communication patterns. 
Analyze the following questionnaire responses from a caregiver about an AAC user:

${formattedResponses}

Based on these responses, please provide:

1. COMMUNICATION_PARTNERS: Identify the key communication partners and categorize them (family, professionals, peers, etc.)
2. COMMUNICATION_CONTEXTS: Identify the main contexts/locations where communication occurs
3. TOPICS_OF_INTEREST: Extract topics of interest or preferred activities
4. COMMUNICATION_PATTERNS: Identify any patterns in how the AAC user communicates
5. STRENGTHS: Identify communication strengths
6. CHALLENGES: Identify communication challenges
7. RECOMMENDATIONS: Provide 3-5 specific recommendations for personalizing the AAC system

Format your response as JSON with the following structure:
{
  "communicationPartners": {
    "family": ["name1", "name2"],
    "professionals": ["name1", "name2"],
    "peers": ["name1", "name2"]
  },
  "communicationContexts": ["context1", "context2"],
  "topicsOfInterest": ["topic1", "topic2"],
  "communicationPatterns": ["pattern1", "pattern2"],
  "strengths": ["strength1", "strength2"],
  "challenges": ["challenge1", "challenge2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

If any section cannot be determined from the responses, include an empty array for that section.
`,
    })

    // Parse the JSON response
    try {
      const analysisData = JSON.parse(text)
      return NextResponse.json(analysisData)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse analysis results", rawText: text }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in analyze-responses API:", error)
    return NextResponse.json({ error: "Failed to analyze responses" }, { status: 500 })
  }
}
