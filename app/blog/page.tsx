import { headers } from "next/headers";

interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  updatedAt: string;
}

async function fetchPosts() {
  const headerList = headers();
  const rawHost = headerList.get("host")?.trim();
  const rawProtocol = headerList.get("x-forwarded-proto")?.trim();
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();

  const parsedHost = rawHost && rawHost.length > 0 ? rawHost.split(",")[0].trim() : "localhost:3000";
  const normalizedHost = parsedHost.replace(/^https?:\/\//i, "");
  const host = normalizedHost.length > 0 ? normalizedHost : "localhost:3000";
  const parsedProtocol = rawProtocol && rawProtocol.length > 0 ? rawProtocol.split(",")[0].trim() : "http";
  const protocol = /^https?$/i.test(parsedProtocol) ? parsedProtocol : "http";

  const defaultBaseUrl = `${protocol}://${host}`;
  let baseUrl = defaultBaseUrl;

  if (envBaseUrl) {
    try {
      baseUrl = new URL(envBaseUrl, defaultBaseUrl).origin;
    } catch {
      baseUrl = defaultBaseUrl;
    }
  }

  const apiUrl = new URL("/api/blog", baseUrl);

  const response = await fetch(apiUrl, {
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
