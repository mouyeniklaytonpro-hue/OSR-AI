import assert from "node:assert/strict";
import test from "node:test";
import { AGENT_IDS, AGENT_PROFILES } from "./agents.js";
import { OSR_AUTO_PROFILE } from "./companies/osr-auto.js";
import { OSR_CONSEIL_PROFILE } from "./companies/osr-conseil.js";
import {
  OpenAIServiceError,
  runBusinessBrain,
} from "./openai-business-brain.js";

interface CapturedOpenAICall {
  messages: Array<{ role: string; content: string }>;
  response_format?: {
    type: string;
    json_schema?: {
      strict?: boolean;
      schema?: {
        properties?: {
          selectedAgents?: { items?: { enum?: string[] } };
        };
      };
    };
  };
}

async function withMockedRouterResponse(
  routerContent: string,
  run: (calls: CapturedOpenAICall[]) => Promise<void>,
): Promise<void> {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const calls: CapturedOpenAICall[] = [];
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as CapturedOpenAICall;
    calls.push(body);
    const isRouter = body.messages[0]?.content.includes(
      "routeur du Business Brain",
    );
    const content = isRouter
      ? routerContent
      : "Contribution de test sans appel externe.";
    return Response.json({ choices: [{ message: { content } }] });
  };

  try {
    await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
}

test("coordinates selected agents with OSR context and factual guardrails", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const calls: Array<{ role: string; content: string }[]> = [];
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      messages: Array<{ role: string; content: string }>;
    };
    calls.push(body.messages);

    const systemMessage = body.messages[0].content;
    const content = systemMessage.includes("routeur du Business Brain")
      ? JSON.stringify({
          objective: "Préparer une stratégie de communication et de contenu.",
          selectedAgents: ["marketing-seo", "content-creative"],
          rationale: "La demande combine visibilité et création de contenu.",
        })
      : systemMessage.includes("Tu es un agent expert")
        ? systemMessage.includes("Nom: Marketing & SEO")
          ? "Contribution marketing : clarifier les audiences avant de choisir les canaux."
          : "Contribution éditoriale : adapter le calendrier au brief et aux ressources confirmées."
        : "## Recommandation\n\nCommencer par valider les objectifs et les ressources disponibles.";

    return Response.json({ choices: [{ message: { content } }] });
  };

  try {
    const result = await runBusinessBrain(
      "Préparer une stratégie marketing et un calendrier de contenu pour OSR Conseil.",
      OSR_CONSEIL_PROFILE,
    );

    assert.deepEqual(
      [result.mission.primaryAgent, ...result.mission.secondaryAgents],
      ["marketing-seo", "content-creative"],
    );
    assert.equal(calls.length, 4);
    assert.ok(
      calls.every((messages) =>
        messages[0].content.includes("Contexte propre a l'entreprise active : OSR Conseil"),
      ),
    );
    assert.ok(
      calls.every((messages) =>
        messages[0].content.includes("Communication & Social Media"),
      ),
    );
    assert.ok(calls.every((messages) => !messages[0].content.includes("OSR Auto")));
    assert.ok(calls.every((messages) => !messages[0].content.includes("OSR by Saint")));
    assert.ok(
      calls.every((messages) =>
        messages[0].content.includes("Contexte universel OSR-AI"),
      ),
    );
    assert.ok(
      calls[1].some((message) =>
        message.content.includes("partenaires specialises"),
      ),
    );
    assert.ok(
      calls[2].some((message) =>
        message.content.includes("partenaires specialises"),
      ),
    );
    assert.ok(
      calls[3][0].content.includes("N'invente jamais de faits, chiffres"),
    );
    assert.ok(
      calls[3][0].content.includes("jusqu'a trois questions de clarification"),
    );
    assert.ok(
      calls[3][0].content.includes("n'annonce pas de montant ni de devise"),
    );
    assert.ok(
      calls[3][1].content.includes("Contribution marketing"),
    );
    assert.ok(
      calls[3][1].content.includes("Contribution éditoriale"),
    );
    assert.match(result.answer, /Commencer par valider/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});

test("keeps each business run limited to its supplied company profile", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const calls: Array<{ role: string; content: string }[]> = [];
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      messages: Array<{ role: string; content: string }>;
    };
    calls.push(body.messages);
    const isRouter = body.messages[0].content.includes(
      "routeur du Business Brain",
    );
    const content = isRouter
      ? JSON.stringify({
          objective: "Organiser une strategie commerciale.",
          selectedAgents: ["business-strategist"],
          rationale: "La demande porte sur la strategie.",
        })
      : "Proposition a valider selon les informations communiquees.";

    return Response.json({ choices: [{ message: { content } }] });
  };

  try {
    await runBusinessBrain(
      "Organiser une strategie commerciale.",
      OSR_AUTO_PROFILE,
    );

    assert.equal(calls.length, 3);
    assert.ok(
      calls.every((messages) =>
        messages[0].content.includes("Contexte propre a l'entreprise active : OSR Auto"),
      ),
    );
    assert.ok(
      calls.every((messages) =>
        messages[0].content.includes("Location automobile"),
      ),
    );
    assert.ok(
      calls.every((messages) =>
        messages[0].content.includes("OSR Auto") &&
        !messages[0].content.includes("OSR Conseil") &&
        !messages[0].content.includes("Communication & Social Media"),
      ),
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});

test("constrains routing to exact IDs and accepts each of the five agents", async () => {
  assert.deepEqual(Object.keys(AGENT_PROFILES), AGENT_IDS);
  assert.equal(
    new Set(Object.values(AGENT_PROFILES).map(({ name }) => name)).size,
    AGENT_IDS.length,
  );

  for (const agentId of AGENT_IDS) {
    await withMockedRouterResponse(
      JSON.stringify({
        objective: "Présenter OSR Conseil à partir des informations fournies.",
        selectedAgents: [agentId],
        rationale: `Le profil ${AGENT_PROFILES[agentId].name} est pertinent.`,
      }),
      async (calls) => {
        const result = await runBusinessBrain(
          "Présente OSR Conseil sans inventer de données.",
          OSR_CONSEIL_PROFILE,
        );

        assert.deepEqual(
          [result.mission.primaryAgent, ...result.mission.secondaryAgents],
          [agentId],
        );
        assert.equal(calls.length, 3);
        assert.equal(calls[0].response_format?.type, "json_schema");
        assert.equal(calls[0].response_format?.json_schema?.strict, true);
        assert.deepEqual(
          calls[0].response_format?.json_schema?.schema?.properties
            ?.selectedAgents?.items?.enum,
          AGENT_IDS,
        );
      },
    );
  }
});

test("accepts multiple authorized agents in the router response", async () => {
  await withMockedRouterResponse(
    JSON.stringify({
      objective: "Présenter les activités et le modèle économique.",
      selectedAgents: [...AGENT_IDS],
      rationale: "Les cinq expertises contribuent aux sujets demandés.",
    }),
    async (calls) => {
      const result = await runBusinessBrain(
        "Présente OSR Conseil : activité, positionnement, pôles, modèle économique, clients et objectifs.",
        OSR_CONSEIL_PROFILE,
      );

      assert.deepEqual(
        [result.mission.primaryAgent, ...result.mission.secondaryAgents],
        AGENT_IDS,
      );
      assert.equal(calls.length, AGENT_IDS.length + 2);
      assert.ok(
        calls.every((call) =>
          call.messages[0].content.includes(
            "Contexte propre a l'entreprise active : OSR Conseil",
          ),
        ),
      );
      for (const service of OSR_CONSEIL_PROFILE.services) {
        assert.ok(
          calls.every((call) => call.messages[0].content.includes(service)),
        );
      }
      assert.ok(
        calls.every((call) =>
          call.messages[0].content.includes(
            "Modele hybride : certaines prestations sont realisees en interne et d'autres sont sous-traitees a des partenaires specialises en competences specifiques.",
          ),
        ),
      );
      assert.ok(
        calls.every((call) =>
          call.messages[0].content.includes(
            "OSR Conseil coordonne les projets web.",
          ),
        ),
      );
      assert.ok(
        calls.every((call) =>
          call.messages[0].content.includes(
            "Aucune hypothese metier n'est documentee dans ce profil.",
          ),
        ),
      );
      assert.ok(
        calls.every((call) =>
          call.messages[0].content.includes(
            "La repartition des prestations realisees en interne et sous-traitees, service par service.",
          ),
        ),
      );
      for (const [index, agentId] of AGENT_IDS.entries()) {
        const agentPrompt = calls[index + 1].messages[0].content;
        assert.ok(agentPrompt.includes(`Nom: ${AGENT_PROFILES[agentId].name}`));
        assert.ok(agentPrompt.includes(AGENT_PROFILES[agentId].mission));
      }
    },
  );
});

test("isolates a supplied client profile from OSR Conseil context", async () => {
  const clientProfile = {
    id: "client-pilot",
    name: "Client pilote",
    services: ["Service client de test"],
    businessContext: {
      confirmedInformation: ["Fait confirme client de test."],
      hypotheses: ["Hypothese client de test a valider."],
      missingInformation: ["Information manquante client de test."],
    },
  } as const;

  await withMockedRouterResponse(
    JSON.stringify({
      objective: "Organiser la mission du client pilote.",
      selectedAgents: [...AGENT_IDS],
      rationale: "Les cinq expertises sont mobilisees pour le test.",
    }),
    async (calls) => {
      await runBusinessBrain(
        "Organise la mission du client pilote.",
        clientProfile,
      );

      assert.equal(calls.length, AGENT_IDS.length + 2);
      assert.ok(
        calls.every((call) => {
          const systemPrompt = call.messages[0].content;
          return (
            systemPrompt.includes(
              "Contexte propre a l'entreprise active : Client pilote",
            ) &&
            systemPrompt.includes("Fait confirme client de test.") &&
            systemPrompt.includes("Hypothese client de test a valider.") &&
            systemPrompt.includes("Information manquante client de test.") &&
            !systemPrompt.includes("OSR Conseil") &&
            !systemPrompt.includes("Communication & Social Media") &&
            !systemPrompt.includes("Creation digitale & Web") &&
            !systemPrompt.includes("partenaires specialises")
          );
        }),
      );
    },
  );
});

const invalidRouterResponses: Array<[string, string]> = [
  ["malformed JSON", "{not-json"],
  [
    "display names instead of IDs",
    JSON.stringify({
      objective: "Présenter OSR Conseil.",
      selectedAgents: ["Marketing & SEO"],
      rationale: "Le nom affiché a été fourni au lieu de l'identifiant.",
    }),
  ],
  [
    "unknown agent IDs",
    JSON.stringify({
      objective: "Présenter OSR Conseil.",
      selectedAgents: ["unknown-agent"],
      rationale: "Cet agent n'existe pas dans les profils.",
    }),
  ],
  [
    "missing or extra fields",
    JSON.stringify({
      objective: "Présenter OSR Conseil.",
      selectedAgents: ["business-strategist"],
      rationale: "Réponse contenant un champ inattendu.",
      fallbackAgent: "business-strategist",
    }),
  ],
];

for (const [description, routerContent] of invalidRouterResponses) {
  test(`rejects ${description} without selecting a fallback agent`, async () => {
    await withMockedRouterResponse(routerContent, async (calls) => {
      await assert.rejects(
        runBusinessBrain(
          "Présente OSR Conseil sans inventer de données.",
          OSR_CONSEIL_PROFILE,
        ),
        (error: unknown) =>
          error instanceof OpenAIServiceError && error.status === 502,
      );
      assert.equal(calls.length, 1);
    });
  });
}
