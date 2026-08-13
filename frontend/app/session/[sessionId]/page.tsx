import { SessionPage } from "@/modules/participant";
import { RequireAuth } from "@/modules/auth/components/session-gates";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return (
    <RequireAuth role="participant">
      <SessionPage sessionId={sessionId} />
    </RequireAuth>
  );
}
