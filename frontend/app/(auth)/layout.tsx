import { RedirectIfAuthenticated } from "@/modules/auth/components/session-gates";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RedirectIfAuthenticated />
      {children}
    </>
  );
}
