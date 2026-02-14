import { openai as createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

export const openai = createOpenAI

const DEFAULT_OPENAI_MODEL = "gpt-5-mini"

function shouldUseResponsesApi(modelName: string): boolean {
	return modelName.toLowerCase().startsWith("gpt-5")
}

function normalizeOpenAIModelName(modelName: string): string {
	const normalized = modelName.trim().toLowerCase()

	if (normalized === "gpt-5 mini" || normalized === "gpt5-mini" || normalized === "gpt5 mini") {
		return "gpt-5-mini"
	}

	return modelName.trim()
}

export function getOpenAIModelName(): string {
	return normalizeOpenAIModelName(process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL)
}

export function getOpenAITextModel() {
	const modelName = getOpenAIModelName()

	// GPT-5 model IDs use the OpenAI Responses API in the AI SDK.
	// This avoids sending `max_tokens`, which GPT-5 rejects.
	return shouldUseResponsesApi(modelName) ? openai.responses(modelName as any) : openai(modelName as any)
}

function extractResponsesApiText(payload: any): string {
	if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
		return payload.output_text.trim()
	}

	if (Array.isArray(payload?.output)) {
		const text = payload.output
			.flatMap((item: any) => (Array.isArray(item?.content) ? item.content : []))
			.map((part: any) => {
				if (typeof part?.text === "string") return part.text
				if (typeof part?.text?.value === "string") return part.text.value
				return ""
			})
			.join("\n")
			.trim()

		if (text) {
			return text
		}
	}

	return ""
}

export async function generateOpenAIText(params: { prompt: string; maxTokens: number; temperature?: number }) {
	const modelName = getOpenAIModelName()

	if (!shouldUseResponsesApi(modelName)) {
		const { text } = await generateText({
			model: getOpenAITextModel(),
			prompt: params.prompt,
			...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
			maxTokens: params.maxTokens,
		})

		return text
	}

	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error("OpenAI API key is not configured")
	}

	const response = await fetch("https://api.openai.com/v1/responses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: modelName,
			input: params.prompt,
			max_output_tokens: params.maxTokens,
		}),
	})

	const payload = await response.json().catch(() => ({}))

	if (!response.ok) {
		const message = payload?.error?.message || `OpenAI Responses API error (${response.status})`
		throw new Error(message)
	}

	const text = extractResponsesApiText(payload)
	if (!text) {
		throw new Error("Empty response from AI model")
	}

	return text
}
