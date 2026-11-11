import { AGENT_PROFILES, type AgentId } from "./agents";

export type AnalysisMethod = "keyword-rules" | "external-engine";

export interface IntentAnalysis {
  objective: string;
  selectedAgents: readonly AgentId[];
  rationale: string;
  method: AnalysisMethod;
}

export interface IntentAnalyzer {
  analyze(request: string): Promise<IntentAnalysis>;
}

export interface MissionStep {
  order: number;
  agentId: AgentId;
  description: string;
}

export type HumanApprovalStatus = "not-required" | "pending" | "approved";

export interface HumanApproval {
  required: boolean;
  status: HumanApprovalStatus;
  reason?: string;
  approvedBy?: string;
}

export interface MissionPlan {
  initialRequest: string;
  objective: string;
  primaryAgent: AgentId;
  secondaryAgents: readonly AgentId[];
  steps: readonly MissionStep[];
  expectedResult: string;
  analysisMethod: AnalysisMethod;
  analysisRationale: string;
  humanApproval: HumanApproval;
}

interface RoutingSignal {
  terms: readonly string[];
  weight?: number;
}

const ROUTING_SIGNALS: Readonly<Record<AgentId, readonly RoutingSignal[]>> = {
  "marketing-seo": [
    {
      terms: [
        "seo",
        "referencement",
        "referencement naturel",
        "optimisation pour les moteurs de recherche",
      ],
    },
    {
      terms: [
        "visibilite",
        "visibilite en ligne",
        "visibilite numerique",
        "presence en ligne",
        "presence digitale",
      ],
    },
    {
      terms: [
        "positionnement",
        "positionnements",
        "positionner la marque",
        "notoriete de la marque",
        "reseau social",
        "reseaux sociaux",
        "social media",
      ],
    },
    {
      terms: [
        "strategie marketing",
        "marketing digital",
        "strategie de communication digitale",
        "communication digitale",
        "campagne marketing",
      ],
    },
    {
      terms: [
        "audience cible",
        "attirer de nouveaux clients",
        "acquisition de clients",
        "trafic organique",
        "mots cles",
      ],
    },
  ],
  "content-creative": [
    {
      terms: [
        "article",
        "contenu",
        "contenus",
        "idee de contenu",
        "idees de contenu",
        "idees de contenus",
        "creation de contenu",
        "creation de contenus",
        "publication",
        "publications",
        "post",
        "posts",
      ],
    },
    {
      terms: [
        "calendrier editorial",
        "calendriers editoriaux",
        "calendrier de publication",
        "calendriers de publication",
        "pilier editorial",
        "piliers editoriaux",
        "calendrier de contenu",
        "calendriers de contenu",
        "storytelling",
        "angle editorial",
      ],
    },
    {
      terms: [
        "direction creative",
        "concept creatif",
        "concepts creatifs",
        "message de marque",
        "identite de marque",
        "newsletter",
        "newsletters",
        "script video",
        "scripts video",
      ],
    },
  ],
  "business-strategist": [
    {
      terms: [
        "diagnostic strategique",
        "analyse strategique",
        "diagnostic d'entreprise",
        "strategie d'entreprise",
        "modele d'affaires",
        "modele economique",
        "decision strategique",
        "risque strategique",
      ],
      weight: 3,
    },
    {
      terms: [
        "developper mon activite",
        "developper son activite",
        "developpement de l'activite",
        "croissance de l'entreprise",
        "structurer mon organisation",
        "plan d'action priorise",
        "prioriser les actions",
      ],
    },
    {
      terms: [
        "strategie commerciale",
        "strategie de vente",
        "strategie de developpement commercial",
      ],
    },
  ],
  "sales-analytics": [
    {
      terms: [
        "chiffre d'affaires",
        "revenu",
        "revenus",
        "recette",
        "recettes",
        "rentabilite",
        "benefice",
        "benefices",
        "profit",
        "profits",
        "marge",
        "marges",
        "ventes",
        "volume des ventes",
      ],
    },
    {
      terms: [
        "prospection",
        "prospect",
        "prospects",
        "processus commercial",
        "processus de vente",
        "pipeline commercial",
        "crm",
        "developpement commercial",
        "performance commerciale",
        "performances commerciales",
        "performance des ventes",
        "performances des ventes",
      ],
      weight: 2,
    },
    {
      terms: [
        "conversion",
        "conversions",
        "taux de conversion",
        "indicateur commercial",
        "indicateurs commerciaux",
        "indicateur de vente",
        "indicateurs de vente",
        "indicateur de performance commerciale",
        "indicateurs de performance commerciale",
        "suivi des ventes",
        "suivi commercial",
        "kpi",
      ],
    },
  ],
  "training-executive": [
    {
      terms: [
        "formation",
        "formations",
        "former",
        "formateur",
        "atelier",
        "ateliers",
        "parcours pedagogique",
        "montee en competence",
      ],
    },
    {
      terms: [
        "procedure",
        "procedures",
        "mode operatoire",
        "modes operatoires",
        "onboarding",
        "integration des nouveaux",
      ],
    },
    {
      terms: [
        "organisation des equipes",
        "organiser mon equipe",
        "organiser les equipes",
        "accompagnement operationnel",
        "accompagner les equipes",
        "encadrement des equipes",
      ],
    },
    {
      terms: [
        "procedure d'onboarding",
        "procedures d'onboarding",
        "procedure d'integration",
        "procedures d'integration",
      ],
    },
  ],
};

const AGENT_PRIORITY: readonly AgentId[] = [
  "business-strategist",
  "sales-analytics",
  "marketing-seo",
  "content-creative",
  "training-executive",
];

const EXTERNAL_ACTION_TERMS = [
  "envoyer",
  "envoie",
  "envoyez",
  "publier",
  "publie",
  "publiez",
  "poster",
  "poste",
  "postez",
  "mettre en ligne",
  "mets en ligne",
  "mettez en ligne",
  "supprimer",
  "supprime",
  "supprimez",
  "modifier",
  "modifie",
  "modifiez",
  "deployer",
  "deploie",
  "deployez",
  "acheter",
  "achete",
  "achetez",
  "payer",
  "paie",
  "payez",
  "contacter",
  "contacte",
  "contactez",
  "relancer",
  "relance",
  "relancez",
  "signer",
  "signe",
  "signez",
  "engager",
  "engage",
  "engagez",
];

const SENSITIVE_TERMS = [
  "donnees personnelles",
  "information confidentielle",
  "informations confidentielles",
  "mot de passe",
  "dossier medical",
  "donnees financieres",
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsTerm(text: string, term: string): boolean {
  return ` ${text} `.includes(` ${normalizeText(term)} `);
}

function approvalForRequest(request: string): HumanApproval {
  const normalizedRequest = normalizeText(request);
  const externalAction = EXTERNAL_ACTION_TERMS.find((term) =>
    containsTerm(normalizedRequest, term),
  );
  const sensitiveData = SENSITIVE_TERMS.find((term) =>
    containsTerm(normalizedRequest, term),
  );

  if (externalAction || sensitiveData) {
    return {
      required: true,
      status: "pending",
      reason: externalAction
        ? `L'action « ${externalAction} » peut produire un effet externe.`
        : "La demande mentionne des données sensibles.",
    };
  }

  return { required: false, status: "not-required" };
}

export class RuleBasedIntentAnalyzer implements IntentAnalyzer {
  async analyze(request: string): Promise<IntentAnalysis> {
    const normalizedRequest = normalizeText(request);
    const rankedAgents = AGENT_PRIORITY
      .map((agentId) => ({
        agentId,
        score: ROUTING_SIGNALS[agentId].reduce(
          (total, signal) =>
            total +
            (signal.terms.some((term) => containsTerm(normalizedRequest, term))
              ? (signal.weight ?? 1)
              : 0),
          0,
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          AGENT_PRIORITY.indexOf(left.agentId) -
            AGENT_PRIORITY.indexOf(right.agentId),
      );

    const selectedAgents = rankedAgents.length
      ? rankedAgents.map(({ agentId }) => agentId)
      : ["business-strategist" as const];
    const primaryAgent = selectedAgents[0];
    const matchedExpertises = rankedAgents.length
      ? rankedAgents.map(({ agentId }) => AGENT_PROFILES[agentId].name)
      : [AGENT_PROFILES[primaryAgent].name];

    return {
      objective: `Transformer la demande en un plan de travail exploitable : « ${request.trim()} »`,
      selectedAgents,
      rationale: rankedAgents.length
        ? `Routage déterministe par mots-clés vers : ${matchedExpertises.join(", ")}. Aucun moteur IA n'est connecté.`
        : `Aucun mot-clé métier reconnu ; ${matchedExpertises[0]} est utilisé comme agent généraliste par défaut. Aucun moteur IA n'est connecté.`,
      method: "keyword-rules",
    };
  }
}

const defaultIntentAnalyzer = new RuleBasedIntentAnalyzer();

export async function prepareMission(
  request: string,
  analyzer: IntentAnalyzer = defaultIntentAnalyzer,
): Promise<MissionPlan> {
  const initialRequest = request.trim();
  if (!initialRequest) {
    throw new Error("La demande utilisateur ne peut pas être vide.");
  }

  const analysis = await analyzer.analyze(initialRequest);
  if (analysis.selectedAgents.length === 0) {
    throw new Error("L'analyse doit sélectionner au moins un agent existant.");
  }

  const [primaryAgent, ...secondaryAgents] = analysis.selectedAgents;
  const steps: MissionStep[] = [
    {
      order: 1,
      agentId: primaryAgent,
      description: `Analyser la demande selon l'expertise de ${AGENT_PROFILES[primaryAgent].name}.`,
    },
    ...secondaryAgents.map((agentId, index) => ({
      order: index + 2,
      agentId,
      description: `Compléter l'analyse avec l'expertise de ${AGENT_PROFILES[agentId].name}.`,
    })),
    {
      order: secondaryAgents.length + 2,
      agentId: primaryAgent,
      description: "Consolider les contributions en une proposition à valider.",
    },
  ];

  return {
    initialRequest,
    objective: analysis.objective,
    primaryAgent,
    secondaryAgents,
    steps,
    expectedResult:
      "Un plan de travail structuré et des recommandations à vérifier à partir des informations fournies.",
    analysisMethod: analysis.method,
    analysisRationale: analysis.rationale,
    humanApproval: approvalForRequest(initialRequest),
  };
}

export function approveMission(
  plan: MissionPlan,
  approver: string,
): MissionPlan {
  const approvedBy = approver.trim();
  if (!approvedBy) {
    throw new Error("Le nom de la personne approbatrice est requis.");
  }
  if (!plan.humanApproval.required) {
    return plan;
  }

  return {
    ...plan,
    humanApproval: { ...plan.humanApproval, status: "approved", approvedBy },
  };
}

export function isMissionAuthorized(plan: MissionPlan): boolean {
  return (
    !plan.humanApproval.required || plan.humanApproval.status === "approved"
  );
}