import { HostShell } from "@/modules/host/components/host-shell";
import { RequireAuth } from "@/modules/auth/components/session-gates";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth role="host">
      <HostShell>{children}</HostShell>
    </RequireAuth>
  );
}
