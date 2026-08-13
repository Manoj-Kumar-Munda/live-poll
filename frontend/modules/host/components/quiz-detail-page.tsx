type QuizDetailPageProps = {
  quizId: string;
};

export function QuizDetailPage({ quizId }: QuizDetailPageProps) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        Quiz detail
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Quiz <span className="font-mono">{quizId}</span>
      </p>
    </main>
  );
}
