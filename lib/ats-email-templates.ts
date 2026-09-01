export interface EmailTemplate {
  id: string;
  name: string;
  category: "interview" | "assessment" | "offer" | "rejection" | "status" | "custom";
  subject: (vars: { name: string; jobTitle: string; department?: string }) => string;
  body: (vars: { name: string; jobTitle: string; department?: string; matchedSkills?: string[] }) => string;
}

export const ATS_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "interview_invite",
    name: "Interview Invitation (Initial Screening)",
    category: "interview",
    subject: ({ jobTitle }) => `Interview Invitation: ${jobTitle} at Anthrix`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

Thank you for your interest in joining Anthrix and applying for the ${jobTitle} position. We have reviewed your background and were impressed by your profile.

We would love to invite you to an initial 30-minute introductory interview to discuss your experience, review your past achievements, and share more details about the role and our team.

Please let us know your availability over the coming days, or share a preferred time window.

Looking forward to speaking with you!

Best regards,
Anthrix Hiring Team
https://anthrix.com`,
  },
  {
    id: "assessment_round",
    name: "Technical / Practical Assessment Round",
    category: "assessment",
    subject: ({ jobTitle }) => `Next Steps: ${jobTitle} Assessment — Anthrix`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

Thank you for speaking with us during the initial screening for the ${jobTitle} role.

Based on our conversation, we would like to invite you to the next stage of our evaluation process: a short practical assessment designed to evaluate your domain problem-solving and execution approach.

Details & Instructions:
- Estimated time: 2–3 hours at your own pace
- Submission deadline: [Insert Date / e.g. 48 hours from receipt]
- Task brief: [Insert link or details]

If you have any questions before getting started, please don't hesitate to reach out.

Best of luck,
Anthrix Hiring Team
https://anthrix.com`,
  },
  {
    id: "final_round",
    name: "Final Leadership Interview",
    category: "interview",
    subject: ({ jobTitle }) => `Final Round Interview: ${jobTitle} with Anthrix Leadership`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

Congratulations on advancing through our assessment process for the ${jobTitle} position! Our team was very impressed with your work.

We would like to invite you to the final interview round with our leadership team. This will be a 30–45 minute conversation focused on long-term alignment, project vision, and team culture.

Please let us know what time slots suit you best this week.

Warm regards,
Anthrix Hiring Team
https://anthrix.com`,
  },
  {
    id: "job_offer",
    name: "Official Job Offer Letter 🎉",
    category: "offer",
    subject: ({ jobTitle }) => `Job Offer: ${jobTitle} at Anthrix Solutions 🎉`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

We are thrilled to offer you the position of ${jobTitle} at Anthrix Solutions!

Throughout the selection process, your skills, communication, and track record truly stood out, and we believe you will make a tremendous impact on our team and client projects.

Offer Overview:
- Position: ${jobTitle}
- Working Model: Remote
- Proposed Start Date: [Insert Start Date]
- Compensation: [Insert Compensation & Commission Details]

Please review these terms and let us know if you have any questions. To accept, simply reply to this email confirming your acceptance.

Welcome to the team!

Warm congratulations,
Anthrix Leadership Team
https://anthrix.com`,
  },
  {
    id: "polite_rejection",
    name: "Polite & Respectful Rejection",
    category: "rejection",
    subject: ({ jobTitle }) => `Update regarding your application for ${jobTitle} at Anthrix`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

Thank you for taking the time to apply for the ${jobTitle} position at Anthrix and for sharing your background with us.

After careful review, we have decided to move forward with other candidates whose experience more closely matches our immediate project requirements at this time.

We were genuinely impressed by your qualifications and will keep your profile in our talent network for future opportunities that align with your skillset.

We wish you every success in your ongoing job search and career endeavors.

Warm regards,
Anthrix Hiring Team
https://anthrix.com`,
  },
  {
    id: "application_received",
    name: "Application Received & Under Review",
    category: "status",
    subject: ({ jobTitle }) => `Application Received: ${jobTitle} at Anthrix`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

Thank you for submitting your application and resume for the ${jobTitle} position at Anthrix.

Our recruitment team is currently reviewing your profile and qualifications against our role requirements. If your background aligns with what we're looking for, we will reach out with details regarding the next steps.

Thank you once again for your interest in Anthrix.

Best regards,
Anthrix Talent Acquisition
https://anthrix.com`,
  },
  {
    id: "custom_blank",
    name: "Custom Blank Email",
    category: "custom",
    subject: ({ jobTitle }) => `Message regarding your ${jobTitle} application at Anthrix`,
    body: ({ name, jobTitle }) =>
      `Hi ${name},

[Write your custom message here]

Best regards,
Anthrix Hiring Team
https://anthrix.com`,
  },
];
