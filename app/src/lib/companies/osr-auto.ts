import type { CompanyProfile } from "../company-profile";

export const OSR_AUTO_PROFILE = {
  id: "osr-auto",
  name: "OSR Auto",
  services: ["Location automobile", "Developpement commercial automobile"],
} as const satisfies CompanyProfile;