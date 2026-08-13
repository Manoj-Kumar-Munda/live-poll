import { QuizDetailPage } from "@/modules/host";
import { RequireAuth } from "@/modules/auth/components/session-gates";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <RequireAuth role="host">
      <QuizDetailPage quizId={id} />
    </RequireAuth>
  );
}
