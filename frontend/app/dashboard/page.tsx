import { DashboardPage } from "@/modules/host";
import { RequireAuth } from "@/modules/auth/components/session-gates";

export default function Page() {
  return (
    <RequireAuth role="host">
      <DashboardPage />
    </RequireAuth>
  );
}
