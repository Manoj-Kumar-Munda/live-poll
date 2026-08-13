import { SessionPage } from "@/modules/participant";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <SessionPage sessionId={sessionId} />;
}
