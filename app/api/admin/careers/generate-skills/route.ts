import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, department, overview, responsibilities } = await req.json();

    if (!title || !department) {
      return NextResponse.json({ error: "Title and department are required." }, { status: 400 });
    }

    const [atsKeyRecord, atsModelRecord, mainKeyRecord, mainModelRecord] = await Promise.all([
      db.systemSetting.findUnique({ where: { key: "ats_groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "ats_groq_model" } }),
      db.systemSetting.findUnique({ where: { key: "groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "groq_model" } }),
    ]);

    const apiKey = (
      atsKeyRecord?.value ||
      process.env.ATS_GROQ_API_KEY ||
      mainKeyRecord?.value ||
      process.env.GROQ_API_KEY ||
      ""
    ).trim();

    const model = (
      atsModelRecord?.value ||
      process.env.ATS_GROQ_MODEL ||
      mainModelRecord?.value ||
      "llama-3.3-70b-versatile"
    ).trim();

    if (!apiKey) {
      // Fallback: return sensible role-based defaults for various domains
      const fallbackMap: Record<string, { requirements: string[]; niceToHave: string[] }> = {
        "Engineering": {
          requirements: ["3+ years professional software engineering experience", "TypeScript & modern JavaScript (ES2022+)", "REST API design & integration", "Git version control & CI/CD pipelines", "Strong problem-solving and system design skills"],
          niceToHave: ["Next.js / React experience", "Cloud platforms (AWS, GCP, or Vercel)", "Docker & containerization", "Prior startup or agency experience"],
        },
        "AI / Machine Learning": {
          requirements: ["Experience with LLMs and prompt engineering", "Python proficiency (pandas, numpy, PyTorch or TensorFlow)", "RAG pipeline design and vector databases", "Familiarity with Hugging Face ecosystem", "Strong mathematics and statistics foundation"],
          niceToHave: ["LangChain / LlamaIndex experience", "Fine-tuning or RLHF experience", "Groq, OpenAI, or Anthropic API integrations", "MLOps and model deployment"],
        },
        "Design & Creative": {
          requirements: ["Proficiency in Figma or Adobe Creative Suite", "Strong understanding of visual hierarchy, typography, and color theory", "Component-based design systems", "User research and rapid prototyping", "Proven portfolio demonstrating high-quality visual or product design"],
          niceToHave: ["Motion graphics / animation skills", "Basic frontend understanding (HTML/CSS)", "Design token architecture", "3D asset creation"],
        },
        "Marketing & Growth": {
          requirements: ["Proven experience executing growth campaigns and acquisition channels", "Strong analytical skills and data-driven decision making", "Content strategy and copywriting proficiency", "SEO, SEM, and paid ad management", "Experience with marketing analytics and CRM tools"],
          niceToHave: ["B2B SaaS / agency marketing background", "Email marketing automation (HubSpot, Mailchimp)", "Social media community building", "Conversion rate optimization (CRO)"],
        },
        "Sales & Business Development": {
          requirements: ["Proven track record in client prospecting, outreach, and deal closing", "Strong verbal and written communication skills", "CRM pipeline management (HubSpot, Salesforce)", "Ability to conduct discovery calls and lead product demos", "Self-motivated with strong follow-up discipline"],
          niceToHave: ["Tech services or agency sales experience", "Cold outreach automation tools", "Enterprise client negotiation experience"],
        },
        "Operations & Management": {
          requirements: ["Strong project management and organizational skills", "Experience with agile/scrum workflows (Jira, Linear, Notion)", "Cross-functional team coordination", "Process optimization and documentation", "Risk mitigation and stakeholder communication"],
          niceToHave: ["Agency or fast-paced startup experience", "Budgeting and resource allocation", "Client relationship management"],
        },
        "Video & Media Production": {
          requirements: ["Proficiency in Premiere Pro, After Effects, or DaVinci Resolve", "Strong storytelling, pacing, and sound design skills", "Color grading and audio cleanup", "Short-form (Reels/TikTok) and long-form video editing", "Proven portfolio or showreel"],
          niceToHave: ["Motion graphics & 2D animation", "Thumbnail design in Photoshop", "Scriptwriting and storyboarding"],
        },
        "Content & Copywriting": {
          requirements: ["Exceptional written and editorial communication in English", "Research skills and ability to break down complex topics", "SEO optimization and keyword placement", "Brand voice alignment and messaging", "Portfolio of published articles, copy, or technical docs"],
          niceToHave: ["Tech/SaaS copywriting experience", "Social media copy creation", "Email newsletter management"],
        },
      };

      const matchedKey = Object.keys(fallbackMap).find((k) =>
        department.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(department.toLowerCase()) ||
        title.toLowerCase().includes(k.toLowerCase())
      );

      const defaults = (matchedKey && fallbackMap[matchedKey]) || {
        requirements: [
          `Proven professional experience in ${title}`,
          "Strong domain knowledge and best-practice execution",
          "Excellent communication, teamwork, and problem-solving skills",
          "High attention to detail and accountability for deliverables",
          "Ability to work independently in a fast-paced environment",
        ],
        niceToHave: [
          "Prior experience in high-growth agency or startup environments",
          "Relevant tools and industry certifications",
          "Cross-disciplinary collaboration experience",
        ],
      };
      return NextResponse.json(defaults);
    }

    const prompt = `You are the Lead Hiring Specialist and Recruiter at Anthrix.
Generate realistic, specific, and actionable job requirements for the following role across ANY domain (Engineering, Design, Marketing, Sales, Operations, Video/Media, HR, Finance, Writing, Management, etc.).

Role Title: ${title}
Department: ${department}
${overview ? `Role Overview:\n${overview}` : ""}
${responsibilities ? `Responsibilities:\n${responsibilities}` : ""}

Return ONLY valid JSON. No markdown code fences, no extra text:
{
  "requirements": ["Specific must-have skill, experience, or tool 1", "Must-have 2", "Must-have 3", "Must-have 4", "Must-have 5"],
  "niceToHave": ["Bonus skill, tool, or qualification 1", "Bonus skill 2", "Bonus skill 3"]
}

Rules:
- requirements should be 5-7 specific, realistic must-have qualifications for this exact role
- niceToHave should be 3-5 genuinely optional but valued bonus qualifications
- Tailor strictly to "${title}" in "${department}" — be concrete with industry-standard tools, competencies, and experience
- Do NOT assume the role is tech/engineering unless the title or department explicitly states so
- Do NOT repeat items in both arrays`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!res.ok) throw new Error(`Groq status ${res.status}`);

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);

    return NextResponse.json({
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      niceToHave: Array.isArray(parsed.niceToHave) ? parsed.niceToHave : [],
    });
  } catch (error: any) {
    console.error("Skills generation error:", error);
    return NextResponse.json({ error: "Failed to generate skills" }, { status: 500 });
  }
}
