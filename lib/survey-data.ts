export interface QuestionOption {
  id: string
  text: string
  score: number // 1, 0, or -1 based on column
}

export interface Question {
  id: string
  text: string
  section: string
  options: QuestionOption[]
}

export interface Section {
  id: string
  title: string
  description: string
  questions: Question[]
  weight: number // Weight for final calculation
  tabHeader: string
}

export const sections: Section[] = [
  {
    id: "decision-making",
    title: "Local Security Decision Making Authority",
    tabHeader: "Decision Making",
    description: "Questions regarding local security decision making authority and governance.",
    weight: 2,
    questions: [
      {
        id: "decision-1",
        text: "If there is a breach in security, who gets to know first in the LGA?",
        section: "decision-making",
        options: [
          { id: "d1-1", text: "LGA Chair", score: 1 },
          { id: "d1-2", text: "Div Police Officer", score: 1 },
          { id: "d1-3", text: "Trad Ruler", score: 1 },
          { id: "d1-4", text: "Cmmty Ldr", score: 1 },
          { id: "d1-5", text: "Unsure", score: 0 },
          { id: "d1-6", text: "Any other personality or entity", score: -1 },
        ],
      },
      {
        id: "decision-2",
        text: "Does the LG have a full-fledged Dept of Security?",
        section: "decision-making",
        options: [
          { id: "d2-1", text: "Yes", score: 1 },
          { id: "d2-2", text: "Unsure", score: 0 },
          { id: "d2-3", text: "No", score: 0 },
        ],
      },
      {
        id: "decision-3",
        text: "Is there a standing Committee for security decision making in LGA?",
        section: "decision-making",
        options: [
          { id: "d3-1", text: "Yes", score: 1 },
          { id: "d3-2", text: "Unsure", score: 0 },
          { id: "d3-3", text: "No", score: 0 },
        ],
      },
      {
        id: "decision-4",
        text: "Are there community reps in the Committee such as traditional rulers, community/youth/women leaders, faith based organisations, NGOs?",
        section: "decision-making",
        options: [
          { id: "d4-1", text: "Yes", score: 1 },
          { id: "d4-2", text: "Unsure", score: 0 },
          { id: "d4-3", text: "No", score: 0 },
        ],
      },
      {
        id: "decision-5",
        text: "How often does the Security Committee meet?",
        section: "decision-making",
        options: [
          { id: "d5-1", text: "Daily", score: 1 },
          { id: "d5-2", text: "Emergency", score: 1 },
          { id: "d5-3", text: "Unsure", score: 0 },
          { id: "d5-4", text: "Weekly", score: 0 },
          { id: "d5-5", text: "Monthly", score: -1 },
          { id: "d5-6", text: "Quarterly", score: -1 },
        ],
      },
      {
        id: "decision-6",
        text: "Does LG have security professionals to analyse information before security decisions are made?",
        section: "decision-making",
        options: [
          { id: "d6-1", text: "Yes", score: 1 },
          { id: "d6-2", text: "Unsure", score: 0 },
          { id: "d6-3", text: "No", score: 0 },
        ],
      },
      {
        id: "decision-7",
        text: "Is LGA Chairman responsible for security decision making in LGA?",
        section: "decision-making",
        options: [
          { id: "d7-1", text: "Yes", score: 1 },
          { id: "d7-2", text: "Unsure", score: 0 },
          { id: "d7-3", text: "No", score: 0 },
        ],
      },
      {
        id: "decision-8",
        text: "How long does it take for security decisions to be made after a security alert?",
        section: "decision-making",
        options: [
          { id: "d8-1", text: "Within 48 hours", score: 1 },
          { id: "d8-2", text: "Unsure", score: 0 },
          { id: "d8-3", text: "Within a week", score: 0 },
          { id: "d8-4", text: "After a week", score: -1 },
        ],
      },
      {
        id: "decision-9",
        text: "Does LG Chairman have to clear security decisions from a higher authority before implementation?",
        section: "decision-making",
        options: [
          { id: "d9-1", text: "No", score: 1 },
          { id: "d9-2", text: "Unsure", score: 0 },
          { id: "d9-3", text: "Yes", score: -1 },
        ],
      },
      {
        id: "decision-10",
        text: "Can LG Chairman instruct the Police and/or security agencies in the locality on security decisions made?",
        section: "decision-making",
        options: [
          { id: "d10-1", text: "Yes", score: 1 },
          { id: "d10-2", text: "Unsure", score: 0 },
          { id: "d10-3", text: "No", score: 0 },
        ],
      },
    ],
  },
  {
    id: "instruments",
    title: "Development of Local Security Instruments",
    tabHeader: "Security Instrunments",
    description: "Questions regarding development of local security instruments.",
    weight: 1,
    questions: [
      {
        id: "instruments-1",
        text: "Does the LGA have a duly elected Chairman or an appointed leadership?",
        section: "instruments",
        options: [
          { id: "i1-1", text: "Yes", score: 1 },
          { id: "i1-2", text: "Unsure", score: 0 },
          { id: "i1-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-2",
        text: "Does the LGA have an active legislature?",
        section: "instruments",
        options: [
          { id: "i2-1", text: "Yes", score: 1 },
          { id: "i2-2", text: "Unsure", score: 0 },
          { id: "i2-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-3",
        text: "Does LGA have a Department responsible for developing security instruments?",
        section: "instruments",
        options: [
          { id: "i3-1", text: "Yes", score: 1 },
          { id: "i3-2", text: "Unsure", score: 0 },
          { id: "i3-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-4",
        text: "Does the LGA have a trained security practitioner heading this Department?",
        section: "instruments",
        options: [
          { id: "i4-1", text: "Yes", score: 1 },
          { id: "i4-2", text: "Unsure", score: 0 },
          { id: "i4-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-5",
        text: "Does the LGA have Byelaw(s) on security provision?",
        section: "instruments",
        options: [
          { id: "i5-1", text: "Yes", score: 1 },
          { id: "i5-2", text: "Unsure", score: 0 },
          { id: "i5-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-6",
        text: "Does the LGA have Regulations on security provision?",
        section: "instruments",
        options: [
          { id: "i6-1", text: "Yes", score: 1 },
          { id: "i6-2", text: "Unsure", score: 0 },
          { id: "i6-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-7",
        text: "Does the LGA have an MOU with government and/or non-governmental organisations on security provision?",
        section: "instruments",
        options: [
          { id: "i7-1", text: "Yes", score: 1 },
          { id: "i7-2", text: "Unsure", score: 0 },
          { id: "i7-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-8",
        text: "Does the LGA have protocol(s) and Standard Operating Procedures guiding various agencies on security provision in the LGA?",
        section: "instruments",
        options: [
          { id: "i8-1", text: "Yes", score: 1 },
          { id: "i8-2", text: "Unsure", score: 0 },
          { id: "i8-3", text: "No", score: 0 },
        ],
      },
      {
        id: "instruments-9",
        text: "Are security laws/regulations in the LGA made by the State Government?",
        section: "instruments",
        options: [
          { id: "i9-1", text: "No", score: 1 },
          { id: "i9-2", text: "Unsure", score: 0 },
          { id: "i9-3", text: "Yes", score: -1 },
        ],
      },
      {
        id: "instruments-10",
        text: "Has the LGA conducted any capacity building programme on the development of security instruments?",
        section: "instruments",
        options: [
          { id: "i10-1", text: "Yes", score: 1 },
          { id: "i10-2", text: "Unsure", score: 0 },
          { id: "i10-3", text: "No", score: 0 },
        ],
      },
    ],
  },
  {
    id: "intelligence",
    title: "Local Security Intelligence and Early Warning",
    tabHeader: "Intelligence & Early Warning",
    description: "Questions regarding local security intelligence gathering and early warning.",
    weight: 2,
    questions: [
      {
        id: "intelligence-1",
        text: "Which organisations are responsible for security intelligence gathering in the LGA?",
        section: "intelligence",
        options: [
          { id: "in1-1", text: "NPF", score: 1 },
          { id: "in1-2", text: "DSS", score: 1 },
          { id: "in1-3", text: "Vigilante", score: 1 },
          { id: "in1-4", text: "Unsure", score: 0 },
        ],
      },
      {
        id: "intelligence-2",
        text: "Do these organisations share their intelligence with the LG Chairman on a need-to-know basis?",
        section: "intelligence",
        options: [
          { id: "in2-1", text: "Yes", score: 1 },
          { id: "in2-2", text: "Unsure", score: 0 },
          { id: "in2-3", text: "No", score: -1 },
        ],
      },
      {
        id: "intelligence-3",
        text: "Does the LG have its own independent intelligence gathering organisation?",
        section: "intelligence",
        options: [
          { id: "in3-1", text: "Yes", score: 1 },
          { id: "in3-2", text: "Unsure", score: 0 },
          { id: "in3-3", text: "No", score: 0 },
        ],
      },
      {
        id: "intelligence-4",
        text: "Which entities are part of this organisation?",
        section: "intelligence",
        options: [
          { id: "in4-1", text: "Trad Ruler", score: 1 },
          { id: "in4-2", text: "Cmmty Ldr", score: 1 },
          { id: "in4-3", text: "Unsure", score: 0 },
        ],
      },
      {
        id: "intelligence-5",
        text: "Is security intelligence in the LGA enabled by technology such as drones, CCTV?",
        section: "intelligence",
        options: [
          { id: "in5-1", text: "Yes", score: 1 },
          { id: "in5-2", text: "Unsure", score: 0 },
          { id: "in5-3", text: "No", score: 0 },
        ],
      },
      {
        id: "intelligence-6",
        text: "Does the LG conduct capacity building programmes on local intelligence gathering?",
        section: "intelligence",
        options: [
          { id: "in6-1", text: "Yes", score: 1 },
          { id: "in6-2", text: "Unsure", score: 0 },
          { id: "in6-3", text: "No", score: 0 },
        ],
      },
      {
        id: "intelligence-7",
        text: "Does the LG have a fusion centre for local intelligence coordination and analysis?",
        section: "intelligence",
        options: [
          { id: "in7-1", text: "Yes", score: 1 },
          { id: "in7-2", text: "Unsure", score: 0 },
          { id: "in7-3", text: "No", score: 0 },
        ],
      },
      {
        id: "intelligence-8",
        text: "Does the LG have its own independent structures for security early warning?",
        section: "intelligence",
        options: [
          { id: "in8-1", text: "Yes", score: 1 },
          { id: "in8-2", text: "Unsure", score: 0 },
          { id: "in8-3", text: "No", score: 0 },
        ],
      },
      {
        id: "intelligence-9",
        text: "Which medium is typically used for dissemination of security early warning?",
        section: "intelligence",
        options: [
          { id: "in9-1", text: "Radio", score: 1 },
          { id: "in9-2", text: "TV", score: 1 },
          { id: "in9-3", text: "Oral tradition", score: 1 },
          { id: "in9-4", text: "Unsure", score: 0 },
        ],
      },
      {
        id: "intelligence-10",
        text: "Does the LG have an electronic medium that covers the entire local government area?",
        section: "intelligence",
        options: [
          { id: "in10-1", text: "Yes", score: 1 },
          { id: "in10-2", text: "Unsure", score: 0 },
          { id: "in10-3", text: "No", score: 0 },
        ],
      },
    ],
  },
  {
    id: "resources",
    title: "Dedicated Resources for Local Security Provision",
    description: "Questions regarding dedicated resources for local security provision.",
    tabHeader: "Resources",
    weight: 2,
    questions: [
      {
        id: "resources-1",
        text: "Does the LG annually conduct a process of budgeting?",
        section: "resources",
        options: [
          { id: "r1-1", text: "Yes", score: 1 },
          { id: "r1-2", text: "Unsure", score: 0 },
          { id: "r1-3", text: "No", score: -1 },
        ],
      },
      {
        id: "resources-2",
        text: "Who approves this Budget?",
        section: "resources",
        options: [
          { id: "r2-1", text: "LG Chair", score: 1 },
          { id: "r2-2", text: "LG Council", score: 1 },
          { id: "r2-3", text: "Unsure", score: 0 },
          { id: "r2-4", text: "State Govt", score: -1 },
        ],
      },
      {
        id: "resources-3",
        text: "Where does the LG get statutory funding from?",
        section: "resources",
        options: [
          { id: "r3-1", text: "Fed Govt", score: 1 },
          { id: "r3-2", text: "State Govt", score: 1 },
          { id: "r3-3", text: "Unsure", score: 0 },
        ],
      },
      {
        id: "resources-4",
        text: "Does the LG Budget usually contain provisions for security?",
        section: "resources",
        options: [
          { id: "r4-1", text: "Yes", score: 1 },
          { id: "r4-2", text: "Unsure", score: 0 },
          { id: "r4-3", text: "No", score: -1 },
        ],
      },
      {
        id: "resources-5",
        text: "Are the provisions for security based on a formal security survey and security need assessment?",
        section: "resources",
        options: [
          { id: "r5-1", text: "Yes", score: 1 },
          { id: "r5-2", text: "Unsure", score: 0 },
          { id: "r5-3", text: "No", score: 0 },
        ],
      },
      {
        id: "resources-6",
        text: "What is the typical percentage provision for security compared to the total budget?",
        section: "resources",
        options: [
          { id: "r6-1", text: "Above 10%", score: 1 },
          { id: "r6-2", text: "Unsure", score: 0 },
          { id: "r6-3", text: "Below 10%", score: -1 },
        ],
      },
      {
        id: "resources-7",
        text: "Is the fund made available for security sufficient for security needs?",
        section: "resources",
        options: [
          { id: "r7-1", text: "Yes", score: 1 },
          { id: "r7-2", text: "Unsure", score: 0 },
          { id: "r7-3", text: "No", score: 0 },
        ],
      },
      {
        id: "resources-8",
        text: "Does the LG always get its budget for security?",
        section: "resources",
        options: [
          { id: "r8-1", text: "Yes", score: 1 },
          { id: "r8-2", text: "Unsure", score: 0 },
          { id: "r8-3", text: "No", score: 0 },
        ],
      },
      {
        id: "resources-9",
        text: "Does the LG regularly receive support from the State Government on security?",
        section: "resources",
        options: [
          { id: "r9-1", text: "Yes", score: 1 },
          { id: "r9-2", text: "Unsure", score: 0 },
          { id: "r9-3", text: "No", score: 0 },
        ],
      },
      {
        id: "resources-10",
        text: "Does the LG have other non-governmental sources of financial support for security?",
        section: "resources",
        options: [
          { id: "r10-1", text: "Yes", score: 1 },
          { id: "r10-2", text: "Unsure", score: 0 },
          { id: "r10-3", text: "No", score: 0 },
        ],
      },
    ],
  },
  {
    id: "institutions",
    title: "Local Security Intervention Institutions and Mechanisms",
    tabHeader: "Institutions & Mechanisms",
    description: "Questions regarding local security response institutions and mechanisms.",
    weight: 2,
    questions: [
      {
        id: "institutions-1",
        text: "Does the state have a local security outfit?",
        section: "institutions",
        options: [
          { id: "inst1-1", text: "Yes", score: 1 },
          { id: "inst1-2", text: "Unsure", score: 0 },
          { id: "inst1-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-2",
        text: "Does the LG have a local equivalent of the state security outfit?",
        section: "institutions",
        options: [
          { id: "inst2-1", text: "Yes", score: 1 },
          { id: "inst2-2", text: "Unsure", score: 0 },
          { id: "inst2-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-3",
        text: "Does the LG have an independent security outfit by any designation such as vigilante, community watch etc?",
        section: "institutions",
        options: [
          { id: "inst3-1", text: "Yes", score: 1 },
          { id: "inst3-2", text: "Unsure", score: 0 },
          { id: "inst3-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-4",
        text: "Does the LG have trained personnel to carry out critical security functions?",
        section: "institutions",
        options: [
          { id: "inst4-1", text: "Yes", score: 1 },
          { id: "inst4-2", text: "Unsure", score: 0 },
          { id: "inst4-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-5",
        text: "Does the LG have protocols with the NPF and/or other security agencies for prompt security response?",
        section: "institutions",
        options: [
          { id: "inst5-1", text: "Yes", score: 1 },
          { id: "inst5-2", text: "Unsure", score: 0 },
          { id: "inst5-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-6",
        text: "Does the LG have an active socio-economic scheme to improve living conditions of people as a (non-kinetic) security measure?",
        section: "institutions",
        options: [
          { id: "inst6-1", text: "Yes", score: 1 },
          { id: "inst6-2", text: "Unsure", score: 0 },
          { id: "inst6-3", text: "No", score: -1 },
        ],
      },
      {
        id: "institutions-7",
        text: "Does the LG have ADR measures in place in times of conflict?",
        section: "institutions",
        options: [
          { id: "inst7-1", text: "Yes", score: 1 },
          { id: "inst7-2", text: "Unsure", score: 0 },
          { id: "inst7-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-8",
        text: "Does the LG have facilities and equipment for security ISR?",
        section: "institutions",
        options: [
          { id: "inst8-1", text: "Yes", score: 1 },
          { id: "inst8-2", text: "Unsure", score: 0 },
          { id: "inst8-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-9",
        text: "Does the LG have the capacity for security interdiction?",
        section: "institutions",
        options: [
          { id: "inst9-1", text: "Yes", score: 1 },
          { id: "inst9-2", text: "Unsure", score: 0 },
          { id: "inst9-3", text: "No", score: 0 },
        ],
      },
      {
        id: "institutions-10",
        text: "Does the LG have an ongoing operation to maintain security or fight insecurity?",
        section: "institutions",
        options: [
          { id: "inst10-1", text: "Yes", score: 1 },
          { id: "inst10-2", text: "Unsure", score: 0 },
          { id: "inst10-3", text: "No", score: 0 },
        ],
      },
    ],
  },
  {
    id: "evaluation",
    title: "Local Security Performance Measurement and Evaluation",
    tabHeader: "Performance Evaluation",
    description: "Questions regarding local security performance monitoring, measurement, evaluation and improvement.",
    weight: 1,
    questions: [
      {
        id: "evaluation-1",
        text: "Does the LG have a documented set of local security performance measurement indicators (PMIs) or measurement standards?",
        section: "evaluation",
        options: [
          { id: "e1-1", text: "Yes", score: 1 },
          { id: "e1-2", text: "Unsure", score: 0 },
          { id: "e1-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-2",
        text: "Does the LG have a system of periodic (annual) security planning?",
        section: "evaluation",
        options: [
          { id: "e2-1", text: "Yes", score: 1 },
          { id: "e2-2", text: "Unsure", score: 0 },
          { id: "e2-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-3",
        text: "Does the LG have the capacity to conduct routine security PMEs?",
        section: "evaluation",
        options: [
          { id: "e3-1", text: "Yes", score: 1 },
          { id: "e3-2", text: "Unsure", score: 0 },
          { id: "e3-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-4",
        text: "Does the LG conduct security surveys?",
        section: "evaluation",
        options: [
          { id: "e4-1", text: "Yes", score: 1 },
          { id: "e4-2", text: "Unsure", score: 0 },
          { id: "e4-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-5",
        text: "Does the LG conduct security need assessment?",
        section: "evaluation",
        options: [
          { id: "e5-1", text: "Yes", score: 1 },
          { id: "e5-2", text: "Unsure", score: 0 },
          { id: "e5-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-6",
        text: "Does the LG have a local security database?",
        section: "evaluation",
        options: [
          { id: "e6-1", text: "Yes", score: 1 },
          { id: "e6-2", text: "Unsure", score: 0 },
          { id: "e6-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-7",
        text: "Does the LG have a system of periodic analysis and evaluation of security preparedness?",
        section: "evaluation",
        options: [
          { id: "e7-1", text: "Yes", score: 1 },
          { id: "e7-2", text: "Unsure", score: 0 },
          { id: "e7-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-8",
        text: "Does the LG have a local security reporting system?",
        section: "evaluation",
        options: [
          { id: "e8-1", text: "Yes", score: 1 },
          { id: "e8-2", text: "Unsure", score: 0 },
          { id: "e8-3", text: "No", score: 0 },
        ],
      },
      {
        id: "evaluation-9",
        text: "Who does the LG report security PME to?",
        section: "evaluation",
        options: [
          { id: "e9-1", text: "State Govt", score: 1 },
          { id: "e9-2", text: "Unsure", score: 0 },
          { id: "e9-3", text: "Others", score: 0 },
        ],
      },
      {
        id: "evaluation-10",
        text: "Does the LG have a formal system of developing capacity for continuous security improvement?",
        section: "evaluation",
        options: [
          { id: "e10-1", text: "Yes", score: 1 },
          { id: "e10-2", text: "Unsure", score: 0 },
          { id: "e10-3", text: "No", score: 0 },
        ],
      },
    ],
  },
]

export const colorCoding = [
  { min: 80, max: 100, code: "Purple", color: "#8B5CF6", label: "Excellent" },
  { min: 60, max: 79, code: "Orange", color: "#F97316", label: "Good" },
  { min: 40, max: 59, code: "Blue", color: "#3B82F6", label: "Satisfactory" },
  { min: 20, max: 39, code: "Yellow", color: "#EAB308", label: "Poor" },
  { min: 0, max: 19, code: "Red", color: "#EF4444", label: "Very Poor" },
]

export function calculateLSAr(sectionScores: Record<string, number>): number {
  const weights = {
    "decision-making": 2,
    instruments: 1,
    intelligence: 2,
    resources: 2,
    institutions: 2,
    evaluation: 1,
  }

  let weightedSum = 0
  Object.entries(sectionScores).forEach(([sectionId, score]) => {
    const weight = weights[sectionId as keyof typeof weights] || 1
    weightedSum += score * weight
  })

  return weightedSum / 10
}

export function getColorCoding(lsarScore: number) {
  return colorCoding.find((coding) => lsarScore >= coding.min && lsarScore <= coding.max) || colorCoding[4]
}
