export const TOOLS = [
  { id: "m365", label: "M365 Copilot", wheel: ["M365", "Copilot"] },
  { id: "excel", label: "Copilot in Excel", wheel: ["Copilot", "in Excel"] },
  { id: "powerpoint", label: "Copilot in PowerPoint", wheel: ["Copilot in", "PowerPoint"] },
  { id: "outlook", label: "Copilot in Outlook", wheel: ["Copilot", "in Outlook"] },
  { id: "outlook-teams", label: "Outlook & Teams", wheel: ["Outlook", "& Teams"] },
  { id: "builder", label: "Agent Builder", wheel: ["Agent", "Builder"] }
];

export const DEMOS = [
  {
    id: "storm", title: "Storm readiness", toolId: "m365",
    prompt: "A severe storm is forecast for our Northern district Thursday. Using my emails, Teams chats, meetings and files from the last two weeks, create a storm-readiness briefing. Tell me: 1) what appears ready, 2) open issues or dependencies, 3) decisions I need to make, and 4) the source for each conclusion.",
    bullets: [
      "M365 Copilot brings together work context across emails, Teams, meetings and files you can access.",
      "A cross-work briefing needs more than a single spreadsheet, presentation or email thread.",
      "Ask for cited evidence and review gaps before making readiness decisions."
    ]
  },
  {
    id: "spreadsheet", title: "Spreadsheet insights", toolId: "excel",
    prompt: "What are the three most interesting things about this data that I should investigate in this spreadsheet? Add a column that classifies these records into High, Medium and Low attention based on the patterns we've identified.",
    bullets: [
      "Copilot in Excel keeps exploration and the new attention column in the workbook.",
      "Review the patterns and agree on classification criteria before relying on the labels.",
      "Why not Microsoft 365 Copilot? Excel is the focused experience for this workbook task within the broader Copilot offering."
    ]
  },
  {
    id: "checklist", title: "Maintenance checklist agent", toolId: "builder",
    prompt: "A crew is preparing to perform maintenance on electrical equipment at a substation. Based only on the material available to you, help me identify the relevant procedures and create a pre-work checklist. Cite the sources you used.",
    bullets: [
      "Agent Builder fits a reusable knowledge agent grounded in a curated set of approved procedure sources.",
      "Require citations and qualified review; an AI checklist does not authorize electrical work.",
      "Why not Microsoft 365 Copilot? A reusable agent scopes this workflow to selected procedures rather than broad work context."
    ]
  },
  {
    id: "presentation", title: "Executive presentation", toolId: "powerpoint",
    prompt: "Summarize the main argument this presentation makes and identify what's missing for an executive audience. Then Rewrite this presentation for senior leadership. Make the business outcome clear, reduce unnecessary technical detail, and improve the narrative flow. Add a slide explaining the recommended next steps and key decisions needed from leadership.",
    bullets: [
      "Copilot in PowerPoint keeps the review, narrative changes and next-steps slide in the presentation.",
      "Check the rewritten slides for accuracy, executive relevance and clear leadership decisions.",
      "Why not Microsoft 365 Copilot? PowerPoint is the focused experience for editing this deck within the broader Copilot offering."
    ]
  }
];
