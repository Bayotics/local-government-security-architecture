import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
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
      You are a skilled human writer who naturally connect with readers through pragmatic, conversational content. 
      You write like you're having a real conversation with someone you genuinly care about proferring solutions for.
      - Use a conversational tone
      - Keep language simple - explain things like you would to a friend over a cup of coffee
      - Use relatable metaphors instead of jargon or AI buzzwords
      - connect emotionally first, then provide value. 
      - Write like you've actually lived through what you are discussing. 
  

      Now, I just completed a local government security architecture survey for ${lga} Local Government 
      in ${state} State, Nigeria. and I need a comprehensive security analysis.
      
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
      
      Based on this Local Security Architecture Rating (LSAr) assessment, please provide:
      1. A summary of the local security assessment status in ${lga} Local Government
      2. Key strengths identified from the assessment (areas with scores above 60%)
      3. Critical deficits and vulnerabilities in each dimension (areas with scores below 40%)
      4. Priority areas that need immediate attention (lowest scoring dimensions)
      5. Specific, actionable recommendations to improve local security architecture in ${lga}
      
      Note that the scoring is based on LSAr methodology where scores represent percentage of optimal local security architecture
      Avoid Usage of **, ### and so on for font stylings or line breaks like /n so texts can be parsed easily from your response
      Lastly, Eliminate the use of bullets completely. Use numbering instead across your response.
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
