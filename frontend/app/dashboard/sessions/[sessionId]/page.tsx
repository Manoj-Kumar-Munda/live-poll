import { SessionControlPage } from "@/modules/host";
import { RequireAuth } from "@/modules/auth/components/session-gates";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return (
    <RequireAuth role="host">
      <SessionControlPage sessionId={sessionId} />
    </RequireAuth>
  );
}
