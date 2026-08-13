import { QuizDetailPage } from "@/modules/host";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <QuizDetailPage quizId={id} />;
}
