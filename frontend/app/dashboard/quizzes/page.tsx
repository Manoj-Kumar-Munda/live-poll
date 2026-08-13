import { QuizListPage } from "@/modules/host";
import { RequireAuth } from "@/modules/auth/components/session-gates";

export default function Page() {
  return (
    <RequireAuth role="host">
      <QuizListPage />
    </RequireAuth>
  );
}
