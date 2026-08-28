import { SessionPage } from "@/modules/participant";
import { RequireParticipantOrGuest } from "@/modules/auth/components/session-gates";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return (
    <RequireParticipantOrGuest sessionId={sessionId}>
      <SessionPage sessionId={sessionId} />
    </RequireParticipantOrGuest>
  );
}
