import { NextResponse } from "next/server"
import { generateOpenAIText, getOpenAIModelName } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

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

    const modelName = getOpenAIModelName()
    const text = await generateOpenAIText({
      prompt,
      maxTokens: 500,
      temperature: modelName.toLowerCase().startsWith("gpt-5") ? undefined : 0.7,
    })

    return NextResponse.json({ advisory: text })
  } catch (error: any) {
    console.error("Error generating neighboring advisory:", error)
    return NextResponse.json(
      { error: "Failed to generate advisory", message: error.message || String(error) },
      { status: 500 }
    )
  }
}
