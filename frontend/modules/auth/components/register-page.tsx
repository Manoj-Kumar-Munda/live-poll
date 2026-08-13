import { AuthShell } from "./auth-shell";
import { RegisterForm } from "./register-form";

export function RegisterPage() {
  return (
    <AuthShell
      title="Create an account"
      subtitle="Register as a host to run quizzes, or as a participant to join live rooms."
      panelTitle="Run live quizzes that feel instant."
      panelSubtitle="Share a room code, lock joining when you're ready, and watch results land the moment the timer ends."
    >
      <RegisterForm />
    </AuthShell>
  );
}
