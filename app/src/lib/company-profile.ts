export interface CompanyBusinessContext {
  confirmedInformation: readonly string[];
  hypotheses: readonly string[];
  missingInformation: readonly string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  services: readonly string[];
  deliveryModel?: string;
  businessContext?: CompanyBusinessContext;
}