import { AuthShell } from "./auth-shell";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to join a live quiz or manage your sessions."
      panelTitle="Turn your audience into participants"
      panelSubtitle="Share a room code and collect live answers — scored MCQs, polls, and word clouds synced for everyone."
    >
      <LoginForm />
    </AuthShell>
  );
}
