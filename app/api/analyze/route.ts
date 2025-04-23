import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { sections } from "@/lib/survey-data"

export async function POST(req: NextRequest) {
  try {
    console.log("API route called: /api/analyze")

    const { answers, state, lga } = await req.json()

    if (!answers || !state || !lga) {
      console.error("Missing required data:", { hasAnswers: !!answers, state, lga })
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Calculate average scores for each section
    const sectionScores: Record<string, { average: number; questions: Array<{ text: string; score: number }> }> = {}

    sections.forEach((section) => {
      const sectionQuestions = section.questions
      let sectionTotal = 0
      const questionDetails: Array<{ text: string; score: number }> = []

      sectionQuestions.forEach((question) => {
        const score = answers[question.id] ?? 0
        sectionTotal += score
        questionDetails.push({
          text: question.text,
          score,
        })
      })

      const average = sectionTotal / sectionQuestions.length

      sectionScores[section.title] = {
        average,
        questions: questionDetails,
      }
    })

    // Format the data for the AI
    const prompt = `
      I need a comprehensive security analysis for ${lga} Local Government in ${state} State, Nigeria.
      
      Here are the average scores (out of 10) for each security dimension:
      ${Object.entries(sectionScores)
        .map(([section, data]) => `- ${section}: ${data.average.toFixed(1)}/10`)
        .join("\n")}
      
      For each section, here are the detailed question scores:
      ${Object.entries(sectionScores)
        .map(
          ([section, data]) => `
          ## ${section}
          ${data.questions.map((q) => `- "${q.text}": ${q.score}/10`).join("\n")}
        `,
        )
        .join("\n")}
      
      Based on this data, please provide:
      1. A summary of the security situation in ${lga} Local Government
      2. Key strengths identified from the assessment (areas with scores 7-10)
      3. Critical deficits and vulnerabilities in each section (areas with scores 0-3)
      4. Specific, actionable recommendations to improve security in ${lga}
      5. Priority areas that need immediate attention (lowest scoring areas)
      
      Format your response with clear headings and bullet points where appropriate.
      Note that the scoring scale is 0-10, where 0 is the lowest/worst and 10 is the highest/best.
    `

    console.log("Calling OpenAI API with model: gpt-4o-mini")

    try {
      // Explicitly set the API key for debugging purposes
      const apiKey = process.env.OPENAI_API_KEY

      if (!apiKey) {
        console.error("OpenAI API key is missing")
        return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
      }

      console.log("API Key available:", apiKey ? "Yes (first 4 chars: " + apiKey.substring(0, 4) + "...)" : "No")

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      })

      console.log("OpenAI API response received, length:", text.length)

      if (!text || text.trim() === "") {
        console.error("Empty response from OpenAI API")
        return NextResponse.json({ error: "Empty response from AI model" }, { status: 500 })
      }

      return NextResponse.json({ analysis: text })
    } catch (apiError: any) {
      console.error("OpenAI API error:", apiError.message, apiError.stack)
      return NextResponse.json(
        {
          error: "AI model error",
          message: apiError.message,
          details: apiError.toString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in analyze route:", error.message, error.stack)
    return NextResponse.json(
      {
        error: "Failed to generate analysis",
        message: error.message,
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
