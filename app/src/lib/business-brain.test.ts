import assert from "node:assert/strict";
import test from "node:test";
import {
  approveMission,
  isMissionAuthorized,
  prepareMission,
} from "./business-brain.js";

test("route une demande SEO vers Marketing & SEO", async () => {
  const plan = await prepareMission(
    "Élaborer une stratégie SEO pour améliorer le référencement et la visibilité.",
  );

  assert.equal(plan.primaryAgent, "marketing-seo");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("retient plusieurs agents pour une demande marketing et éditoriale", async () => {
  const plan = await prepareMission(
    "Préparer une campagne marketing, un calendrier de contenu et rédiger un article SEO.",
  );

  assert.equal(plan.primaryAgent, "marketing-seo");
  assert.deepEqual(plan.secondaryAgents, ["content-creative"]);
});

test("route une demande de stratégie d'entreprise", async () => {
  const plan = await prepareMission(
    "Comparer deux modèles d'affaires et prioriser les risques du lancement.",
  );

  assert.equal(plan.primaryAgent, "business-strategist");
});

test("route une demande de suivi commercial et de KPI", async () => {
  const plan = await prepareMission(
    "Définir les KPI commerciaux et améliorer le suivi des prospects dans le CRM.",
  );

  assert.equal(plan.primaryAgent, "sales-analytics");
});

test("route une demande de formation et de documentation", async () => {
  const plan = await prepareMission(
    "Créer un parcours de formation et documenter la procédure d'onboarding.",
  );

  assert.equal(plan.primaryAgent, "training-executive");
});

test("priorise la stratégie et mobilise Sales pour le diagnostic stratégique", async () => {
  const plan = await prepareMission(
    "Je dirige une entreprise de services B2B qui réalise 250 000 € de chiffre d’affaires annuel. Je souhaite développer mon activité, améliorer ma rentabilité et structurer mon organisation. Réalise un diagnostic stratégique et propose un plan d’action priorisé sur 90 jours.",
  );

  assert.equal(plan.primaryAgent, "business-strategist");
  assert.deepEqual(plan.secondaryAgents, ["sales-analytics"]);
  assert.equal(plan.steps.length, 3);
});

test("priorise Sales et exclut Training pour le développement commercial", async () => {
  const plan = await prepareMission(
    "Mon entreprise souhaite augmenter son chiffre d’affaires de 30 % sur les 12 prochains mois. Je veux améliorer ma prospection, structurer mon processus commercial, augmenter mon taux de conversion et suivre mes performances. Propose une stratégie commerciale complète avec des indicateurs KPI et un plan d’action sur 90 jours.",
  );

  assert.equal(plan.primaryAgent, "sales-analytics");
  assert.deepEqual(plan.secondaryAgents, ["business-strategist"]);
  assert.equal(plan.secondaryAgents.includes("training-executive"), false);
});

test("priorise Sales pour une stratégie commerciale et garde Business en appui", async () => {
  const plan = await prepareMission(
    "Comment augmenter mes ventes et améliorer le taux de conversion avec une stratégie commerciale adaptée ?",
  );

  assert.equal(plan.primaryAgent, "sales-analytics");
  assert.deepEqual(plan.secondaryAgents, ["business-strategist"]);
});

test("mobilise Marketing et Content pour une stratégie de communication éditoriale", async () => {
  const plan = await prepareMission(
    "Je dirige une entreprise de services qui souhaite améliorer sa visibilité et attirer de nouveaux clients professionnels. Construis une stratégie de communication digitale sur 30 jours comprenant le positionnement, les piliers éditoriaux, les réseaux sociaux prioritaires, un calendrier de publication et des idées de contenus.",
  );

  assert.equal(plan.primaryAgent, "marketing-seo");
  assert.deepEqual(plan.secondaryAgents, ["content-creative"]);
});

test("route une demande stratégique ambiguë sans activer les autres expertises", async () => {
  const plan = await prepareMission(
    "Aidez-moi à construire une stratégie d'entreprise pour développer mon activité.",
  );

  assert.equal(plan.primaryAgent, "business-strategist");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("reconnaît le positionnement seul sans surinterpréter stratégie ou développement", async () => {
  const plan = await prepareMission(
    "Je souhaite préciser le positionnement de mon entreprise.",
  );
  const genericPlan = await prepareMission(
    "J’aimerais réfléchir à une stratégie et au développement de mon activité.",
  );

  assert.equal(plan.primaryAgent, "marketing-seo");
  assert.deepEqual(plan.secondaryAgents, []);
  assert.equal(genericPlan.primaryAgent, "business-strategist");
  assert.deepEqual(genericPlan.secondaryAgents, []);
  assert.match(genericPlan.analysisRationale, /Aucun mot-clé métier reconnu/);
});

test("reconnaît les synonymes financiers et les indicateurs de performance commerciale", async () => {
  const plan = await prepareMission(
    "Analyser nos bénéfices, la marge et les indicateurs de performance commerciale.",
  );

  assert.equal(plan.primaryAgent, "sales-analytics");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("ne confond pas les mots génériques avec une intention commerciale ou de formation", async () => {
  const plan = await prepareMission(
    "Je veux revoir notre processus, réfléchir à une stratégie et au développement de notre produit.",
  );

  assert.equal(plan.primaryAgent, "business-strategist");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("ne déclenche pas Sales sur une performance sans contexte commercial", async () => {
  const plan = await prepareMission("Évaluer la performance de cette application.");

  assert.equal(plan.primaryAgent, "business-strategist");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("sélectionne Training uniquement pour une procédure opérationnelle explicite", async () => {
  const trainingPlan = await prepareMission(
    "Rédiger la procédure d'onboarding de l'équipe.",
  );
  const processPlan = await prepareMission(
    "Décrire le processus de livraison du produit.",
  );

  assert.equal(trainingPlan.primaryAgent, "training-executive");
  assert.deepEqual(trainingPlan.secondaryAgents, []);
  assert.equal(processPlan.primaryAgent, "business-strategist");
  assert.deepEqual(processPlan.secondaryAgents, []);
});

test("mobilise plusieurs expertises pertinentes sans confondre processus commercial et formation", async () => {
  const plan = await prepareMission(
    "Pour développer mon activité, améliorez notre visibilité SEO, construisez un calendrier éditorial de contenus et définissez un processus de prospection commerciale avec des KPI.",
  );

  assert.deepEqual(
    [plan.primaryAgent, ...plan.secondaryAgents],
    [
      "sales-analytics",
      "marketing-seo",
      "content-creative",
      "business-strategist",
    ],
  );
  assert.equal(plan.secondaryAgents.includes("training-executive"), false);
});

test("ne sélectionne que Marketing pour une demande SEO ciblée", async () => {
  const plan = await prepareMission(
    "Améliorer le référencement naturel et la visibilité SEO de mon site.",
  );

  assert.equal(plan.primaryAgent, "marketing-seo");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("reconnaît les contenus au pluriel et les demandes de calendrier éditorial", async () => {
  const plan = await prepareMission(
    "Préparer des idées de contenus pour mes calendriers éditoriaux.",
  );

  assert.equal(plan.primaryAgent, "content-creative");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("route une demande de contenu seule vers Content & Creative", async () => {
  const plan = await prepareMission(
    "Rédiger des newsletters et des scripts vidéo pour notre prochaine campagne.",
  );

  assert.equal(plan.primaryAgent, "content-creative");
  assert.deepEqual(plan.secondaryAgents, []);
});

test("utilise le fallback généraliste sans activer artificiellement les agents", async () => {
  const plan = await prepareMission(
    "Bonjour, merci de me souhaiter une bonne journée.",
  );

  assert.equal(plan.primaryAgent, "business-strategist");
  assert.deepEqual(plan.secondaryAgents, []);
  assert.match(plan.analysisRationale, /Aucun mot-clé métier reconnu/);
});

test("priorise les objectifs dominants et départage les scores de façon stable", async () => {
  const strategicPlan = await prepareMission(
    "Préparer un diagnostic stratégique sur la rentabilité et le chiffre d'affaires.",
  );
  const marketingPlan = await prepareMission(
    "Définir une stratégie marketing, améliorer la visibilité SEO et créer des contenus.",
  );

  assert.equal(strategicPlan.primaryAgent, "business-strategist");
  assert.deepEqual(strategicPlan.secondaryAgents, ["sales-analytics"]);
  assert.equal(marketingPlan.primaryAgent, "marketing-seo");
  assert.deepEqual(marketingPlan.secondaryAgents, ["content-creative"]);
});

test("bloque une action externe jusqu'à approbation humaine", async () => {
  const plan = await prepareMission("Envoie la campagne marketing au client.");

  assert.equal(plan.humanApproval.status, "pending");
  assert.equal(isMissionAuthorized(plan), false);
  assert.equal(isMissionAuthorized(approveMission(plan, "Responsable")), true);
});

test("demande une approbation pour les données sensibles", async () => {
  const plan = await prepareMission("Résumer ces données personnelles.");

  assert.equal(plan.humanApproval.status, "pending");
  assert.equal(isMissionAuthorized(plan), false);
});

test("indique explicitement l'absence de moteur IA", async () => {
  const plan = await prepareMission("Aidez-moi à organiser un projet.");

  assert.equal(plan.analysisMethod, "keyword-rules");
  assert.match(plan.analysisRationale, /Aucun moteur IA n'est connecté/);
});