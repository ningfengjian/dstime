import { headers } from "next/headers";

interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  updatedAt: string;
}

function parseOrigin(candidate?: string | null, fallbackProtocol = "http") {
  if (!candidate) return null;

  const value = candidate.trim();
  if (!value) return null;

  try {
    const hasProtocol = /^https?:\/\//i.test(value);
    const url = new URL(hasProtocol ? value : `${fallbackProtocol}://${value}`);
    return url.origin;
  } catch {
    return null;
  }
}

function resolveOrigin() {
  const headerList = headers();

  const envOrigin =
    parseOrigin(process.env.NEXT_PUBLIC_BASE_URL) || parseOrigin(process.env.VERCEL_URL, "https");
  if (envOrigin) return envOrigin;

  const rawHost = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const rawProtocol = headerList.get("x-forwarded-proto");

  const host = parseOrigin(rawHost, rawProtocol?.split(",")[0].trim() || "http");
  if (host) return host;

  const fallbackProtocol = rawProtocol?.split(",")[0].trim() || "http";
  const fallbackHost = rawHost?.split(",")[0].trim() || "localhost:3000";
  const fallbackOrigin = parseOrigin(`${fallbackProtocol}://${fallbackHost}`);
  return fallbackOrigin ?? "http://localhost:3000";
}

async function fetchPosts() {
  const apiUrl = new URL("/api/blog", resolveOrigin());

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
