export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">About</h1>
        <p className="text-muted-foreground">
          dstime helps you craft Discord-ready timestamps with accurate timezone handling and
          easy copy actions. The tool was built to simplify sharing event schedules with global
          communities.
        </p>
        <p className="text-muted-foreground">
          Adjust your date, time, and timezone, preview how Discord will render the message, and
          copy the syntax that fits your context—whether you need a full date, relative time, or a
          raw UNIX timestamp.
        </p>
      </div>
    </main>
  );
}
