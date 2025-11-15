import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { currentLga, neighboringLGAs } = await request.json()

    if (!currentLga || !neighboringLGAs || neighboringLGAs.length === 0) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      )
    }

    const prompt = `You are a skilled security analyst who writes in a conversational, human tone.

Current LGA: ${currentLga.name}
Current LSAr Score: ${currentLga.score}% (${currentLga.rating})

Neighboring LGAs Performance:
${neighboringLGAs.map((lga: any) => `- ${lga.name}: ${lga.score}% (${lga.rating})`).join('\n')}

Based on the neighboring LGAs' security ratings, provide a concise advisory (3-4 sentences) that:
1. Compares the current LGA's performance to its neighbors
2. Identifies any regional security trends or patterns
3. Provides actionable recommendations for improvement or collaboration opportunities

Keep the tone professional, conversational and constructive. Avoid buzzwords.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return NextResponse.json({ advisory: text })
  } catch (error: any) {
    console.error("Error generating neighboring advisory:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate advisory" },
      { status: 500 }
    )
  }
}
