import { AGENT_IDS, type AgentId } from "@/lib/agents";
import { getActiveCompanyProfile } from "@/lib/active-company.server";
import {
  OpenAIServiceError,
  runBusinessBrain,
} from "@/lib/openai-business-brain";

const MAX_REQUEST_LENGTH = 4000;

function isAgentId(value: unknown): value is AgentId {
  return (
    typeof value === "string" &&
    (AGENT_IDS as readonly string[]).includes(value)
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requete doit etre un JSON valide." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return Response.json(
      { error: "Le format de la requete est invalide." },
      { status: 400 },
    );
  }

  const data = body as Record<string, unknown>;
  if (
    typeof data.message !== "string" ||
    !data.message.trim() ||
    data.message.length > MAX_REQUEST_LENGTH
  ) {
    return Response.json(
      {
        error: `La demande doit contenir entre 1 et ${MAX_REQUEST_LENGTH} caracteres.`,
      },
      { status: 400 },
    );
  }

  if (
    data.preferredAgentId !== undefined &&
    !isAgentId(data.preferredAgentId)
  ) {
    return Response.json(
      { error: "L'agent selectionne n'existe pas." },
      { status: 400 },
    );
  }

  try {
    const result = await runBusinessBrain(
      data.message,
      getActiveCompanyProfile(),
      isAgentId(data.preferredAgentId) ? data.preferredAgentId : undefined,
    );

    return Response.json({
      answer: result.answer,
      mission: {
        primaryAgent: result.mission.primaryAgent,
        secondaryAgents: result.mission.secondaryAgents,
        selectedAgents: [
          result.mission.primaryAgent,
          ...result.mission.secondaryAgents,
        ],
        analysisMethod: result.mission.analysisMethod,
        analysisRationale: result.mission.analysisRationale,
        humanApproval: result.mission.humanApproval,
      },
    });
  } catch (error) {
    if (error instanceof OpenAIServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json(
      { error: "Une erreur est survenue pendant la generation de la reponse." },
      { status: 502 },
    );
  }
}
