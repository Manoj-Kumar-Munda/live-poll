import { api } from "@/lib/api";

export async function clearGuestSession() {
  await api.post("/api/sessions/guest-logout");
}
