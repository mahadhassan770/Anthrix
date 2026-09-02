export const team = [
  {
    name: "Mahad Hassan",
    role: "Co-Founder & Technical Lead",
    focus: "AI Architecture & Engineering",
    initials: "MH",
    bio: "Directly architecting and deploying production-grade systems. Specializes in scalable SaaS infrastructure, custom autonomous AI agents, and enterprise integrations engineered for extreme reliability and speed.",
    highlights: [
      "Custom Software & Multi-Tenant SaaS Architecture",
      "Autonomous AI Agents & Enterprise Knowledge Systems",
    ],
    skills: ["AI Systems", "Cloud Architecture", "Full-Stack Engineering", "Workflow Automation"],
    email: "mahadhassan095@gmail.com",
    linkedin: "https://linkedin.com/in/mahad-hassan2003",
    number: "01",
  },
  {
    name: "Abdul Haseeb",
    role: "Co-Founder & Head of Growth",
    focus: "Strategy & Client Solutions",
    initials: "AH",
    bio: "Translates complex business challenges into clear technical roadmaps. Oversees client partnerships, product-market strategy, and delivery alignment to ensure every engagement yields measurable business growth.",
    highlights: [
      "Client Partnership Strategy & Scalable Roadmaps",
      "Revenue Operations & Workflow Transformation",
    ],
    skills: ["Strategic Growth", "Client Success", "Solutions Architecture", "Product Operations"],
    email: "abdulhaseeb7134@gmail.com",
    linkedin: "https://linkedin.com",
    number: "02",
  },
];

export type TeamMember = (typeof team)[number];
