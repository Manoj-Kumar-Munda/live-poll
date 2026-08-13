import { LandingPage } from "@/modules/landing";
import { RedirectIfAuthenticated } from "@/modules/auth/components/session-gates";

export default function Home() {
  return (
    <>
      <RedirectIfAuthenticated />
      <LandingPage />
    </>
  );
}
