import type { CompanyProfile } from "./company-profile";
import { OSR_CONSEIL_PROFILE } from "./companies/osr-conseil";

const ACTIVE_COMPANY_PROFILE: CompanyProfile = OSR_CONSEIL_PROFILE;

export function getActiveCompanyProfile(): CompanyProfile {
  return ACTIVE_COMPANY_PROFILE;
}