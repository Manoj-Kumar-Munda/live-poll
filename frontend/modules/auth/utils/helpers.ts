import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function pathForRole(role: string | null | undefined) {
  return role === "host" ? "/dashboard" : "/home";
}

export function redirectByRole(
  router: AppRouterInstance,
  role: string | null | undefined,
) {
  router.replace(pathForRole(role));
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
