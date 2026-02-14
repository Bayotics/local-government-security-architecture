import { type NextRequest, NextResponse } from "next/server"
import { generateOpenAIText, getOpenAIModelName } from "@/lib/openai"
import { sections, getScoreFromOptionId } from "@/lib/survey-data"

export async function POST(req: NextRequest) {
  try {
    console.log("API route called: /api/analyze")

    const { answers, state, lga } = await req.json()

    if (!answers || !state || !lga) {
      console.error("Missing required data:", { hasAnswers: !!answers, state, lga })
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Calculate average scores for each section using new LSAr methodology
    const sectionScores: Record<string, { average: number; questions: Array<{ text: string; score: number }> }> = {}

    sections.forEach((section) => {
      const sectionQuestions = section.questions
      let sectionTotal = 0
      const questionDetails: Array<{ text: string; score: number }> = []

      sectionQuestions.forEach((question) => {
        let questionScore = 0
        if (answers[question.id] !== undefined) {
          const selectedOptionId = answers[question.id] as string
          questionScore = getScoreFromOptionId(selectedOptionId)
        }

        sectionTotal += questionScore
        questionDetails.push({
          text: question.text,
          score: questionScore,
        })
      })

      const rawScore = sectionTotal
      const finalScore = rawScore < 0 ? 0 : rawScore
      const maxPossibleScore = sectionQuestions.length // Each question can score max 1 point
      const percentageScore = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0

      sectionScores[section.title] = {
        average: percentageScore,
        questions: questionDetails,
      }
    })

    const prompt = `
      You are a professional local security policy analyst. Produce a formal, direct, and evidence-based report.

      Now, I just completed a local government security architecture survey for ${lga} Local Government
      in ${state} State, Nigeria, and I need a comprehensive security analysis.
      
      Here are the percentage scores for each Local Security Architecture (LSAr) dimension:
      ${Object.entries(sectionScores)
        .map(([section, data]) => `- ${section}: ${data.average.toFixed(1)}%`)
        .join("\n")}
      
      For each section, here are the detailed question scores:
      ${Object.entries(sectionScores)
        .map(
          ([section, data]) => `
          ## ${section}
          ${data.questions.map((q) => `- "${q.text}": ${q.score} points`).join("\n")}
        `,
        )
        .join("\n")}
      
      Based on this Local Security Architecture Rating (LSAr) assessment, provide:
      1. A summary of the local security assessment status in ${lga} Local Government
      2. Key strengths identified from the assessment (areas with scores above 60%)
      3. Critical deficits and vulnerabilities in each dimension (areas with scores below 40%)
      4. Priority areas that need immediate attention (lowest scoring dimensions)
      5. Specific, actionable recommendations to improve local security architecture in ${lga}

      Hard style rules (must follow):
      1. Do not use first-person or assistant voice. Never use: "I", "I'll", "I can", "we can", "if you'd like", "let me know", "I can also".
      2. Do not include offers for further help, optional next steps, or add-on deliverables.
      3. Do not include meta-commentary about writing style (for example: "I’ll be blunt", "I’ll be direct", "as an AI").
      4. End with a final numbered section titled exactly "Final Position" that gives a decisive close in 2-4 sentences.
      5. The response must end immediately after "Final Position" with no extra sentence.

      Output rules:
      - Use numbering only throughout (no bullets).
      - Avoid **, ###, markdown styling, and escape characters like /n.
      - Keep total response under 1800 words.
      - Note that scores represent percentage of optimal local security architecture under LSAr methodology.
    `

    console.log(`Calling OpenAI API with model: ${getOpenAIModelName()}`)

    try {
      // Explicitly set the API key for debugging purposes
      const apiKey = process.env.OPENAI_API_KEY

      if (!apiKey) {
        console.error("OpenAI API key is missing")
        return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
      }

      console.log("API Key available:", apiKey ? "Yes (first 4 chars: " + apiKey.substring(0, 4) + "...)" : "No")

      const modelName = getOpenAIModelName()
      const text = await generateOpenAIText({
        prompt,
        maxTokens: 4000,
        temperature: modelName.toLowerCase().startsWith("gpt-5") ? undefined : 0.7,
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
