import type { CompanyProfile } from "../company-profile";

export const OSR_CONSEIL_PROFILE = {
  id: "osr-conseil",
  name: "OSR Conseil",
  services: [
    "Communication & Social Media",
    "Création digitale & Web",
    "Formation",
    "Production visuelle",
  ],
  deliveryModel:
    "Modele hybride : certaines prestations sont realisees en interne et d'autres sont sous-traitees a des partenaires specialises en competences specifiques.",
  businessContext: {
    confirmedInformation: [
      "OSR Conseil coordonne les projets web.",
    ],
    hypotheses: [],
    missingInformation: [
      "La repartition des prestations realisees en interne et sous-traitees, service par service.",
      "Les competences specialisees sous-traitees et les modalites de collaboration avec les prestataires.",
      "Le detail des offres et livrables proposes dans chacun des quatre poles.",
      "Les secteurs servis, les profils de clientele et le positionnement commercial.",
      "Les tarifs, budgets, marges et capacites de production.",
      "Les objectifs, indicateurs, resultats et references clients.",
      "Les zones geographiques desservies et les delais habituels.",
    ],
  },
} as const satisfies CompanyProfile;