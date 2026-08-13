type SessionControlPageProps = {
  sessionId: string;
};

export function SessionControlPage({ sessionId }: SessionControlPageProps) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        Live control room
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Session <span className="font-mono">{sessionId}</span>
      </p>
    </main>
  );
}
