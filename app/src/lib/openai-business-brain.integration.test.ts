import assert from "node:assert/strict";
import test from "node:test";
import { OSR_CONSEIL_PROFILE } from "./companies/osr-conseil.js";
import { runBusinessBrain } from "./openai-business-brain.js";

test(
  "OpenAI generates a real Business Brain response",
  { skip: !process.env.OPENAI_API_KEY },
  async () => {
    const result = await runBusinessBrain(
      "Reponds en incluant exactement le marqueur OSR-OPENAI-OK dans ta reponse.",
      OSR_CONSEIL_PROFILE,
    );

    assert.equal(result.mission.analysisMethod, "external-engine");
    assert.ok(result.mission.primaryAgent);
    assert.match(result.answer, /OSR-OPENAI-OK/);
  },
);
