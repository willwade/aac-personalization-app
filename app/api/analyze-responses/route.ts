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

    // Robustly parse the response (plain JSON, code block, or Vercel/streamed)
    let parsed;
    let jsonString = '';
    let data: any = text;
    // If text is a string, try to parse as JSON
    if (typeof text === 'string') {
      try {
        data = JSON.parse(text);
      } catch (e) {
        // leave as string
      }
    }
    // If data is an object with numbered keys (Vercel AI SDK style)
    if (data && typeof data === 'object') {
      const numberedKeys = Object.keys(data)
        .filter(k => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b));
      if (numberedKeys.length > 0) {
        const concatenated = numberedKeys.map(k => data[k]).join('');
        // Extract code block
        const codeBlockMatch = concatenated.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
          try {
            parsed = JSON.parse(jsonString);
          } catch (err) {
            console.error('Failed to parse JSON from code block (numbered keys):', err, jsonString);
            parsed = { error: 'Invalid JSON in code block', raw: jsonString };
          }
        } else {
          // Try to extract JSON from any curly-brace block
          const curlyBlockMatch = concatenated.match(/({[\s\S]*})/);
          if (curlyBlockMatch) {
            jsonString = curlyBlockMatch[1];
            try {
              parsed = JSON.parse(jsonString);
            } catch (err2) {
              console.error('Failed to parse JSON from curly braces (numbered keys):', err2, jsonString);
              parsed = { error: 'Invalid JSON in curly braces', raw: jsonString };
            }
          } else {
            parsed = { error: 'No JSON found in streamed response', raw: concatenated };
          }
        }
        return NextResponse.json(parsed);
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
          parsed = { error: 'Invalid JSON in code block', raw: jsonString };
        }
      } else {
        const curlyBlockMatch = data.match(/({[\s\S]*})/);
        if (curlyBlockMatch) {
          jsonString = curlyBlockMatch[1];
          try {
            parsed = JSON.parse(jsonString);
          } catch (err2) {
            console.error('Failed to parse JSON from curly braces:', err2, jsonString);
            parsed = { error: 'Invalid JSON in curly braces', raw: jsonString };
          }
        } else {
          parsed = { error: 'No JSON found in response', raw: data };
        }
      }
      return NextResponse.json(parsed);
    }
    // Fallback: return whatever data is
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in analyze-responses API:", error)
    return NextResponse.json({ error: "Failed to analyze responses" }, { status: 500 })
  }
}
