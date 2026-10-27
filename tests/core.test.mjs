import test from "node:test";
import assert from "node:assert/strict";
import { TOOLS, EXAMPLES, validateResult, validatePrompt, enrichResult } from "../which-tool/catalog.mjs";
import { classifyPrompt } from "../which-tool/rules.mjs";
import { landingRotation, selectedIndex } from "../which-tool/wheel.mjs";

export const cases = [
  ["m365", "Find what we agreed across our Teams chats, emails and SharePoint documents."],
  ["m365", "Catch up on work across meetings, emails, and documents in our organization."],
  ["m365", "Bring together our work context across emails and meetings."],
  ["chat", "Explain how a water meter works in plain language."],
  ["chat", "Brainstorm ideas for a public water conservation campaign."],
  ["chat", "Research public information about rainwater harvesting."],
  ["studio", "Build a customer-facing agent on our website that creates cases in our CRM."],
  ["studio", "Create a chatbot with an ERP connector and an approval workflow."],
  ["studio", "An agent for external service actions and multi-channel customer support."],
  ["cowork", "Prepare a maintenance briefing, create a document, then email it to the supervisors."],
  ["cowork", "Organize a review meeting then schedule the meeting with our team."],
  ["cowork", "Compile a report then post it to our team channel."],
  ["code", "I do not code. Build a leak tracker app from my description with a live preview."],
  ["code", "Create an interactive dashboard from my description; I don't code."],
  ["code", "Prototype an internal tool with a live preview."],
  ["autopilot", "A persistent digital teammate with its own identity and memory for supplier reviews over several weeks."],
  ["autopilot", "Proactively follow up on project reviews over weeks, without waiting for another prompt."],
  ["autopilot", "A digital teammate that keeps working on my ongoing goals."],
  ["builder", "Create a simple internal agent that answers questions about our team policies."],
  ["builder", "Build a knowledge-only FAQ agent grounded in SharePoint."],
  ["builder", "Create a declarative agent for internal onboarding."],
  ["github", "Debug our Python meter-data parser in the repository and add unit tests."],
  ["github", "Refactor this TypeScript function and review the pull request."],
  ["github", "Fix a bug in the JavaScript codebase and write tests."],
  ["foundry", "Build a custom AI application with model selection and evaluations."],
  ["foundry", "I need model choice, retrieval, tracing and private networking for an AI application."],
  ["foundry", "Deploy a RAG agent runtime with evaluation and model deployment controls."],
  ["office", "Draft an outage notice in a Word document that I can edit."],
  ["office", "Create an Excel workbook with formulas and charts for the budget."],
  ["office", "Make a PowerPoint presentation with editable slides for the board."],
  ["notebook", "Compare only these selected safety policies and inspection notes in a focused workspace."],
  ["notebook", "Synthesize curated references in a notebook with grounded answers."],
  ["notebook", "Answer using only the selected documents and references."],
  ["depends", "Help me."],
  ["depends", "Which AI should we buy?"],
  ["depends", "Automatically control chlorine dosing at the treatment plant."],
  ["depends", "A recipe for my dinner."],
  ["depends", "Automatically adjust pressure and operate the pump."],
  ["depends", "Set dosing levels autonomously."],
  ["chat", "Explain water conservation. Do not build an agent."],
  ["office", "Create an Excel chart. Do not create a notebook."],
  ["code", "Build a tracker app from my description. Do not debug a repository."],
  ["chat", "Brainstorm ideas for saving water, without creating an agent."],
  ["depends", "I want an Excel workbook and a knowledge agent for onboarding."],
  ["depends", "Choose a tool, no details yet."],
  ["depends", "What is the stock price?"],
  ["depends", "Operate a SCADA valve automatically."],
  ["depends", "Better efficiency please."]
];

test("catalog has all twelve distinct choices", () => {
  assert.equal(TOOLS.length, 12);
  assert.equal(new Set(TOOLS.map(({ id }) => id)).size, 12);
});
for (const [expected, prompt] of cases) {
  test(`offline ${expected}: ${prompt}`, () => {
    const result = classifyPrompt(prompt);
    assert.equal(result.toolId, expected);
    assert.equal(result.mode, "rules");
    validateResult(result);
    assert.ok(result.bullets.every((bullet) => bullet.length <= 160));
  });
}
test("all editable examples produce valid results", () => {
  EXAMPLES.forEach(({ prompt }) => validateResult(classifyPrompt(prompt)));
});
test("input boundaries and exclusions", () => {
  for (const input of ["", "  ", null, 123, "a".repeat(2001)]) assert.throws(() => validatePrompt(input));
  assert.equal(validatePrompt("a".repeat(2000)).length, 2000);
  assert.equal(classifyPrompt("GitHub Copilot").toolId, "depends", "product-name alone is not an intent");
});
test("response contracts reject malformed, invented, or unrelated content", () => {
  const valid = { toolId: "chat", bullets: ["An interactive answer fits."], sourceIds: ["chat"] };
  assert.deepEqual(validateResult(valid), valid);
  for (const raw of [
    null, [], {}, { ...valid, toolId: "invented" }, { ...valid, bullets: [] },
    { ...valid, bullets: ["", "ok"] }, { ...valid, bullets: ["a".repeat(161)] },
    { ...valid, bullets: ["a", "b", "c", "d"] }, { ...valid, sourceIds: ["not-real"] },
    { ...valid, sourceIds: ["github"] }, { ...valid, sourceIds: ["chat", "chat"] }
  ]) assert.throws(() => validateResult(raw));
  assert.equal(enrichResult({ ...valid, mode: "forged", availabilityNote: "invented" }, "rules").mode, "rules");
  assert.throws(() => enrichResult(valid, "forged"));
});
test("every segment lands correctly across repeated spins", () => {
  for (const start of [0, 27.1, 359, 3600, -180]) {
    let rotation = start;
    for (let repeat = 0; repeat < 3; repeat++) {
      for (let i = 0; i < TOOLS.length; i++) {
        const next = landingRotation(rotation, i, TOOLS.length);
        assert.ok(next >= rotation + 1800);
        assert.equal(selectedIndex(next, TOOLS.length), i);
        rotation = next;
      }
    }
  }
  assert.throws(() => landingRotation(0, 12, 12));
});
