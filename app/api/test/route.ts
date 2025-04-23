import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST() {
  try {
    console.log("API test route called")

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error("OpenAI API key is missing")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    console.log("API Key available:", apiKey ? "Yes (first 4 chars: " + apiKey.substring(0, 4) + "...)" : "No")

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: "Say 'Hello, the OpenAI API is working!' in a single short sentence.",
        temperature: 0.5,
        maxTokens: 50,
      })

      console.log("OpenAI API test response:", text)

      return NextResponse.json({ result: text })
    } catch (apiError: any) {
      console.error("OpenAI API error:", apiError.message, apiError.stack)
      return NextResponse.json(
        {
          error: "OpenAI API error",
          message: apiError.message,
          details: apiError.toString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in test route:", error.message, error.stack)
    return NextResponse.json(
      {
        error: "API test failed",
        message: error.message,
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
