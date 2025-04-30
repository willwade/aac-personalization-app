import type { NextApiRequest, NextApiResponse } from "next"

// To use GPT-4, set the OPENAI_API_KEY env variable in your environment.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export const config = {
  api: {
    bodyParser: true,
  },
}

export const handleError = () => {
  // TODO: handle error
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end("Method Not Allowed")
  }

  if (!OPENAI_API_KEY) {
    // Fallback: static adaptive question and suggestions for demo
    return res.status(200).json({
      question: "[DEMO] What is one goal you have for improving communication?",
      suggestedAnswers: [
        "Initiate more conversations",
        "Express feelings independently",
        "Participate in group activities"
      ],
      error: "OPENAI_API_KEY environment variable not set. Using demo fallback."
    });
  }

  const { previousQuestions, previousAnswers, currentQuestionText } = req.body

  try {
    const prompt = `Given the following questionnaire context for an AAC user, suggest the next most relevant question and 3 suggested answers.\n\nPrevious questions: ${JSON.stringify(previousQuestions)}\nPrevious answers: ${JSON.stringify(previousAnswers)}\nCurrent question: ${currentQuestionText}\n\nRespond in JSON with { question, suggestedAnswers }.`

    const completionRes = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in AAC and adaptive communication assessment.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!completionRes.ok) {
      const err = await completionRes.text()
      return res.status(500).json({ error: "OpenAI API error", details: err })
    }

    const data = await completionRes.json()
    const content = data.choices[0].message.content
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      // fallback if model returns non-JSON
      parsed = { question: content, suggestedAnswers: [] }
    }
    return res.status(200).json(parsed)
  } catch {
    return res.status(500).json({ error: "An unknown error occurred" })
  }
}
