export interface SectionQuotation {
  sectionId: string
  title: string
  quotation: string
  subQuotation: string
  author?: string // Optional author field for sections with quotes from specific people
}

export const sectionQuotations: SectionQuotation[] = [
  {
    sectionId: "decision-making",
    title: "Local Security Decision Making Authority",
    author: "Sun Tzu", // Added author for section 1
    quotation:
      "In the midst of chaos, there is also opportunity and security decisions often arise from crises that require strategic clarity.",
    subQuotation:
      "This tracker would seek answers to the questions regarding local security decision making:",
  },
  {
    sectionId: "instruments",
    title: "Development of Local Security Instruments",
    quotation: "Security regulations are not barriers; they are the guardrails that keep progress on the right path",
    subQuotation:
      "This tracker would seek answers to the questions regarding development of local security instruments:",
  },
  {
    sectionId: "intelligence",
    title: "Local Security Intelligence and Early Warning",
    quotation: "The art of intelligence is not just in knowing but in acting before it is too late",
    subQuotation:
      "This tracker would seek answers to the questions regarding local security intelligence gathering and early warning:",
  },
  {
    sectionId: "resources",
    title: "Dedicated Resources for Local Security Provision",
    quotation:
      "Safety and security do not just happen; they are the result of collective consensus and public investment",
    subQuotation:
      "This tracker would seek answers to the questions regarding dedicated resources for local security provision",
  },
  {
    sectionId: "institutions",
    title: "Local Security Intervention Institutions and Mechanisms",
    quotation:
      "A secure society is one where institutions are strong, responses are swift, and the people trust in the shield that protects them.",
    subQuotation:
      "This tracker would seek answers to the questions regarding local security response institutions and mechanisms:",
  },
  {
    sectionId: "evaluation",
    title: "Local Security Performance Measurement and Evaluation",
    author: "Peter Drucker", // Added author for section 6
    quotation: "If you can't measure it, you can't improve it",
    subQuotation:
      "This tracker would seek answers to the questions regarding local security performance monitoring, measurement, evaluation and Improvement",
  },
]

export function getQuotationBySection(sectionId: string): SectionQuotation | undefined {
  return sectionQuotations.find((q) => q.sectionId === sectionId)
}
