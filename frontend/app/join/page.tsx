import { JoinPage } from "@/modules/participant";
import { RequireAuth } from "@/modules/auth/components/session-gates";

export default function Page() {
  return (
    <RequireAuth role="participant">
      <JoinPage />
    </RequireAuth>
  );
}
