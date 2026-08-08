import type { NextRequest } from "next/server";
import { refreshStudioSession } from "@/lib/database/supabase-auth-middleware";

export function middleware(request: NextRequest) {
  return refreshStudioSession(request);
}

export const config = {
  matcher: ["/studio/:path*"],
};
