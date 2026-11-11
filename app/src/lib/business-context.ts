import type { CompanyProfile } from "./company-profile";

export const UNIVERSAL_BUSINESS_CONTEXT = `Contexte universel OSR-AI : traite chaque demande selon le profil de l'entreprise active fourni separement. N'applique jamais des faits d'une entreprise a une autre et ne suppose pas qu'une demande concerne une entreprise si le profil actif ne l'indique pas.

Utilise uniquement les informations effectivement fournies. N'invente pas de donnees d'entreprise, de taille d'equipe, de localisation, de clientele, de tarifs, de marges, de capacite, de performances passees, de budget ou de resultats existants. Distingue clairement les faits confirmes, les hypotheses a valider et les informations manquantes. Une hypothese ne doit jamais etre presentee comme un fait etabli.`;

export function formatCompanyContext(profile: CompanyProfile): string {
	const confirmedInformation = [
		`Poles d'activite et services : ${profile.services.join("; ")}.`,
		...(profile.deliveryModel
			? [`Modele de realisation : ${profile.deliveryModel}`]
			: []),
		...(profile.businessContext?.confirmedInformation ?? []),
	];
	const hypotheses = profile.businessContext?.hypotheses ?? [];
	const missingInformation =
		profile.businessContext?.missingInformation ?? [];

	return [
		`Contexte propre a l'entreprise active : ${profile.name} (${profile.id}).`,
		"Informations confirmees :",
		...confirmedInformation.map((information) => `- ${information}`),
		"Hypotheses a valider :",
		...(hypotheses.length
			? hypotheses.map((hypothesis) => `- ${hypothesis}`)
			: ["- Aucune hypothese metier n'est documentee dans ce profil."]),
		"Informations manquantes :",
		...(missingInformation.length
			? missingInformation.map((information) => `- ${information}`)
			: [
			    "- Aucune information manquante n'est documentee dans ce profil; cela ne signifie pas qu'elle est connue.",
			  ]),
		"Ce contexte concerne uniquement cette entreprise. Ne complete pas les informations absentes par des faits supposes ni par les donnees d'une autre entreprise.",
	].join("\n");
}

export const STRATEGIC_RESPONSE_GUIDANCE = `Produis une recommandation strategique professionnelle, claire et directement exploitable, dans la langue de la demande. Utilise du Markdown valide avec des titres, des paragraphes aeres, des listes ou des tableaux lorsque cela clarifie la lecture, et mets en evidence les recommandations importantes en gras. N'inclus pas de HTML.

Selon sa pertinence, structure la reponse avec les rubriques suivantes :
- Diagnostic
- Objectifs mesurables
- Strategie recommandee
- Plan d'action detaille avec responsables ou dependances a confirmer
- Calendrier indicatif
- Budget estimatif et hypotheses explicites
- KPI et resultats attendus
- Risques et points de vigilance

N'invente jamais de faits, chiffres, budgets, performances ou capacites concernant l'entreprise. Si des informations essentielles manquent, commence par poser jusqu'a trois questions de clarification precises. Tu peux ensuite fournir une approche provisoire en separant explicitement les faits connus, les hypotheses a valider et les recommandations. Pour le budget, n'annonce pas de montant ni de devise sans base exploitable ; indique les postes et les informations necessaires au chiffrage. Pour les objectifs, calendriers et resultats sans donnees de reference, presente des propositions indicatives a valider, jamais des previsions garanties. Omet les rubriques sans pertinence plutot que de les remplir artificiellement.`;
