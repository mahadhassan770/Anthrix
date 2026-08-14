export const team = [
  {
    name: "Mahad Hassan",
    role: "Technical Lead",
    bio: "Focuses entirely on the build. Specializes in Next.js architectures, custom AI agents, and complex n8n workflows that actually work in production. Turns complex technical requirements into scalable systems.",
    skills: ["Next.js", "AI Agents", "Node.js", "n8n", "PostgreSQL", "RAG Systems"],
    number: "01",
  },
  {
    name: "Abdul Haseeb",
    role: "Client Relations & Growth",
    bio: "Translates business problems into technical requirements. Manages outreach, client communication, and ensures every integration moves the needle on revenue. The bridge between vision and execution.",
    skills: ["Strategy", "Growth", "Client Success", "Business Dev", "CRM", "Automation"],
    number: "02",
  },
];

export type TeamMember = (typeof team)[number];
