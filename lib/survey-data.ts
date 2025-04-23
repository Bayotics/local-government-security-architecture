export interface Question {
  id: string
  text: string
  section: string
}

export interface Section {
  id: string
  title: string
  description: string
  questions: Question[]
}

export const sections: Section[] = [
  {
    id: "authority",
    title: "Authority & Governance",
    description:
      "Questions about leadership, governance structures, and decision-making processes related to security.",
    questions: [
      {
        id: "authority-1",
        text: "How effective is the local government leadership in addressing security concerns?",
        section: "authority",
      },
      {
        id: "authority-2",
        text: "To what extent do security agencies collaborate with local government authorities?",
        section: "authority",
      },
      {
        id: "authority-3",
        text: "How clear are the lines of authority during security emergencies?",
        section: "authority",
      },
      {
        id: "authority-4",
        text: "How well do local leaders communicate security policies to citizens?",
        section: "authority",
      },
      {
        id: "authority-5",
        text: "How responsive is the local government to security incidents?",
        section: "authority",
      },
      {
        id: "authority-6",
        text: "How effective is coordination between traditional leaders and formal security structures?",
        section: "authority",
      },
      {
        id: "authority-7",
        text: "To what extent are security decisions made transparently?",
        section: "authority",
      },
      {
        id: "authority-8",
        text: "How well-defined are the roles of different security stakeholders in the local government?",
        section: "authority",
      },
      {
        id: "authority-9",
        text: "How effective is the implementation of security policies at the local level?",
        section: "authority",
      },
      {
        id: "authority-10",
        text: "How accountable are security officials for their actions in the local government?",
        section: "authority",
      },
    ],
  },
  {
    id: "resources",
    title: "Resources & Personnel",
    description:
      "Questions about human resources, equipment, and material resources available for security operations.",
    questions: [
      {
        id: "resources-1",
        text: "How adequate is the number of security personnel in the local government?",
        section: "resources",
      },
      {
        id: "resources-2",
        text: "How well-equipped are the security personnel with necessary tools and equipment?",
        section: "resources",
      },
      {
        id: "resources-3",
        text: "How accessible are emergency response resources during security incidents?",
        section: "resources",
      },
      {
        id: "resources-4",
        text: "How sufficient are the vehicles and transportation resources for security operations?",
        section: "resources",
      },
      {
        id: "resources-5",
        text: "How well-trained are the security personnel in the local government?",
        section: "resources",
      },
      {
        id: "resources-6",
        text: "How adequate are the communication tools and systems for security operations?",
        section: "resources",
      },
      {
        id: "resources-7",
        text: "How well-maintained are the security equipment and resources?",
        section: "resources",
      },
      {
        id: "resources-8",
        text: "How efficient is the distribution of security resources across different areas?",
        section: "resources",
      },
      {
        id: "resources-9",
        text: "How adequate are the medical and first aid resources for emergency situations?",
        section: "resources",
      },
      {
        id: "resources-10",
        text: "How sufficient are the protective gear and equipment for security personnel?",
        section: "resources",
      },
    ],
  },
  {
    id: "funding",
    title: "Funding & Budget Allocation",
    description:
      "Questions about financial resources, budget allocation, and funding mechanisms for security initiatives.",
    questions: [
      {
        id: "funding-1",
        text: "How adequate is the budget allocation for security operations in the local government?",
        section: "funding",
      },
      {
        id: "funding-2",
        text: "How transparent is the management of security funds?",
        section: "funding",
      },
      {
        id: "funding-3",
        text: "How timely is the release of funds for security operations?",
        section: "funding",
      },
      {
        id: "funding-4",
        text: "How equitable is the distribution of security funding across different areas?",
        section: "funding",
      },
      {
        id: "funding-5",
        text: "How sufficient is the funding for security training and capacity building?",
        section: "funding",
      },
      {
        id: "funding-6",
        text: "How adequate is the funding for maintenance of security equipment?",
        section: "funding",
      },
      {
        id: "funding-7",
        text: "How well are security funding needs assessed and prioritized?",
        section: "funding",
      },
      {
        id: "funding-8",
        text: "How effective are the mechanisms for tracking security expenditures?",
        section: "funding",
      },
      {
        id: "funding-9",
        text: "How sufficient is the emergency funding for unexpected security challenges?",
        section: "funding",
      },
      {
        id: "funding-10",
        text: "How sustainable are the current funding models for long-term security needs?",
        section: "funding",
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Facilities",
    description:
      "Questions about physical infrastructure, facilities, and structural elements supporting security operations.",
    questions: [
      {
        id: "infrastructure-1",
        text: "How adequate are the security checkpoints and outposts in strategic locations?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-2",
        text: "How well-maintained are the police stations and security facilities?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-3",
        text: "How sufficient is the lighting in public spaces for nighttime security?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-4",
        text: "How adequate are the emergency shelters and safe houses in the local government?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-5",
        text: "How well-designed are the roads and access routes for emergency response?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-6",
        text: "How secure are the critical infrastructure facilities (water, electricity, etc.)?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-7",
        text: "How adequate are the surveillance systems in public areas?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-8",
        text: "How well-equipped are the emergency response centers?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-9",
        text: "How accessible are security facilities to all communities in the local government?",
        section: "infrastructure",
      },
      {
        id: "infrastructure-10",
        text: "How resilient is the security infrastructure against attacks or natural disasters?",
        section: "infrastructure",
      },
    ],
  },
  {
    id: "community",
    title: "Community Engagement",
    description:
      "Questions about public participation, community involvement, and citizen engagement in security matters.",
    questions: [
      {
        id: "community-1",
        text: "How active are community policing initiatives in the local government?",
        section: "community",
      },
      {
        id: "community-2",
        text: "How willing are citizens to report suspicious activities to authorities?",
        section: "community",
      },
      {
        id: "community-3",
        text: "How effective are community-security agency partnerships?",
        section: "community",
      },
      {
        id: "community-4",
        text: "How well-informed are citizens about security threats and precautions?",
        section: "community",
      },
      {
        id: "community-5",
        text: "How inclusive are security decision-making processes of community input?",
        section: "community",
      },
      {
        id: "community-6",
        text: "How effective are neighborhood watch programs in the local government?",
        section: "community",
      },
      {
        id: "community-7",
        text: "How strong is the trust between security agencies and local communities?",
        section: "community",
      },
      {
        id: "community-8",
        text: "How effective are public awareness campaigns about security issues?",
        section: "community",
      },
      {
        id: "community-9",
        text: "How engaged are youth in positive security initiatives?",
        section: "community",
      },
      {
        id: "community-10",
        text: "How effective are conflict resolution mechanisms at the community level?",
        section: "community",
      },
    ],
  },
  {
    id: "technology",
    title: "Technology & Intelligence",
    description:
      "Questions about technological tools, intelligence gathering, and information systems for security operations.",
    questions: [
      {
        id: "technology-1",
        text: "How advanced are the surveillance technologies used by security agencies?",
        section: "technology",
      },
      {
        id: "technology-2",
        text: "How effective are the intelligence gathering methods in the local government?",
        section: "technology",
      },
      {
        id: "technology-3",
        text: "How well-integrated are the different security information systems?",
        section: "technology",
      },
      {
        id: "technology-4",
        text: "How adequate is the technological training for security personnel?",
        section: "technology",
      },
      {
        id: "technology-5",
        text: "How effective are the early warning systems for security threats?",
        section: "technology",
      },
      {
        id: "technology-6",
        text: "How secure are the communication channels used by security agencies?",
        section: "technology",
      },
      {
        id: "technology-7",
        text: "How well are data analytics utilized in security planning?",
        section: "technology",
      },
      {
        id: "technology-8",
        text: "How accessible are emergency communication systems to the public?",
        section: "technology",
      },
      {
        id: "technology-9",
        text: "How effective is the use of social media monitoring for security purposes?",
        section: "technology",
      },
      {
        id: "technology-10",
        text: "How well-maintained are the technological security systems?",
        section: "technology",
      },
    ],
  },
]
