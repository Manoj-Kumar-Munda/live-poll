import { SessionControlPage } from "@/modules/host";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <SessionControlPage sessionId={sessionId} />;
}
