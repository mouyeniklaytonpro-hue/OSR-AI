import { getActiveCompanyProfile } from "@/lib/active-company.server";

export async function GET() {
  return Response.json(getActiveCompanyProfile(), {
    headers: { "Cache-Control": "no-store" },
  });
}