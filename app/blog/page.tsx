import { headers } from "next/headers";

interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  updatedAt: string;
}

function resolveOrigin() {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envBase) {
    try {
      return new URL(envBase).origin;
    } catch {
      // fall through
    }
  }

  const headerHost = headers().get("host")?.split(",")[0].trim();
  if (headerHost) {
    try {
      return new URL(`http://${headerHost}`).origin;
    } catch {
      // fall through
    }
  }

  return "http://127.0.0.1:3000";
}

async function fetchPosts() {
  const origin = resolveOrigin();
  const apiUrl = `${origin.replace(/\/$/, "")}/api/blog`;

  const response = await fetch(apiUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load posts");
  }

  const data = await response.json();
  return data.posts as BlogPost[];
}

function formatDate(input?: string) {
  if (!input) return "Recently updated";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(input));
}

export default async function BlogPage() {
  const posts = await fetchPosts();

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
            <article key={post.slug} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                <p className="text-sm text-muted-foreground">{formatDate(post.publishedAt ?? post.updatedAt)}</p>
              </div>
              <p className="text-muted-foreground">{post.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
