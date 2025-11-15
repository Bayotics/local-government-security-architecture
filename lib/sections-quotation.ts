export interface SectionQuotation {
  sectionId: string
  title: string
  quotation: string
}

export const sectionQuotations: SectionQuotation[] = [
  {
    sectionId: "decision-making",
    title: "Local Security Decision Making Authority",
    quotation: "Effective security governance begins at grassroots level where local authorities understand community-specific threats. When local government chairmen collaborate with traditional rulers and security professionals in structured committees, they create responsive security architecture. This section examines whether your local government has established necessary authority structures and community partnerships for proactive governance."
  },
  {
    sectionId: "instruments",
    title: "Development of Local Security Instruments",
    quotation: "Laws and regulations form the legal backbone of effective security systems. This section evaluates whether your local government has developed comprehensive byelaws, standard operating procedures, and agreements that guide security provision. Proper documentation and regulatory development ensure security provision is systematic, transparent, and sustainable rather than ad-hoc."
  },
  {
    sectionId: "intelligence",
    title: "Local Security Intelligence and Early Warning",
    quotation: "Prevention requires robust intelligence gathering and early warning systems. This section assesses whether your local government has established mechanisms for collecting and analyzing security intelligence through formal agencies and community networks. Integration of traditional sources with modern technology creates comprehensive situational awareness, transforming security from reactive crisis management to proactive prevention."
  },
  {
    sectionId: "resources",
    title: "Dedicated Resources for Local Security Provision",
    quotation: "Security requires sustained investment in personnel, equipment, and operations. This section examines whether your local government conducts systematic budgeting that allocates sufficient resources based on formal assessments. Diversified funding sources and transparent budgeting processes demonstrate fiscal accountability, ensuring security investments align with community needs."
  },
  {
    sectionId: "institutions",
    title: "Local Security Intervention Institutions and Mechanisms",
    quotation: "Policies are meaningless without capable institutions to implement them. This section evaluates whether your local government has established security outfits, community watch programs, and partnerships with formal agencies for comprehensive coverage. Beyond security responses, effective governments implement socio-economic programs addressing root causes of insecurity like poverty and unemployment."
  },
  {
    sectionId: "evaluation",
    title: "Local Security Performance Measurement and Evaluation",
    quotation: "Continuous improvement requires systematic measurement and evaluation against established benchmarks. This section assesses whether your local government has developed performance indicators, conducts regular assessments, and maintains comprehensive databases. Regular performance measurement transforms security management from intuition-based responses to data-driven continuous improvement cycles."
  }
]

export function getQuotationBySection(sectionId: string): string {
  const quotation = sectionQuotations.find(q => q.sectionId === sectionId)
  return quotation?.quotation || ""
}
