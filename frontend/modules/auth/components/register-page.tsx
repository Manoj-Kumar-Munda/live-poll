import { AuthShell } from "./auth-shell";
import { RegisterForm } from "./register-form";

export function RegisterPage() {
  return (
    <AuthShell
      title="Create an account"
      subtitle="Register as a host to run quizzes, or as a participant to join live rooms."
      panelTitle="Run live sessions people actually join"
      panelSubtitle="Publish a quiz, start a session, and share one room code. Results appear the moment each question ends."
    >
      <RegisterForm />
    </AuthShell>
  );
}
