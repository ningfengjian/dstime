const posts = [
  {
    title: "Why Discord timestamps matter",
    summary:
      "Share event times that automatically adjust to each viewer's timezone, reducing confusion and missed meetings.",
  },
  {
    title: "Formatting tips for chat",
    summary: "Pick between short and long date formats, or use relative timestamps for countdown-style messages.",
  },
  {
    title: "Keeping collaborators in sync",
    summary: "Use UNIX timestamps for automation or bots, and the generator for human-friendly previews in chat.",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Blog</h1>
          <p className="text-muted-foreground">
            Quick reads to help you share schedules and countdowns with your Discord community.
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.title} className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
              <p className="text-muted-foreground">{post.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
