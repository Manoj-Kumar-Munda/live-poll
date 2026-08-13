import { AuthShell } from "./auth-shell";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to join a live quiz or manage your sessions."
      panelTitle="Questions live. Answers instant."
      panelSubtitle="Host scored MCQs, polls, and word clouds — all synced in real time for your audience."
    >
      <LoginForm />
    </AuthShell>
  );
}
