"use client";

import { useEffect, useMemo, useState } from "react";

interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  status: "draft" | "published";
  publishedAt?: string;
  updatedAt: string;
}

const defaultFormState = {
  title: "",
  summary: "",
  content: "",
  status: "draft" as const,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(defaultFormState);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeModeLabel = useMemo(() => (activeSlug ? "更新文章" : "创建文章"), [activeSlug]);

  useEffect(() => {
    fetch("/api/blog?includeDrafts=1")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts as BlogPost[]))
      .catch(() => setMessage("无法加载文章列表"));
  }, []);

  const resetForm = () => {
    setForm(defaultFormState);
    setActiveSlug(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const endpoint = activeSlug ? `/api/blog/${activeSlug}` : "/api/blog";
    const method = activeSlug ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "保存文章失败");
      setLoading(false);
      return;
    }

    if (activeSlug) {
      setPosts((prev) => prev.map((post) => (post.slug === activeSlug ? data.post : post)));
    } else {
      setPosts((prev) => [data.post, ...prev]);
    }

    setMessage("已保存");
    resetForm();
    setLoading(false);
  };

  const startEdit = (post: BlogPost) => {
    setActiveSlug(post.slug);
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      status: post.status,
    });
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full rounded-xl border bg-white p-6 shadow-sm lg:w-1/2">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">{activeModeLabel}</h1>
            <p className="text-sm text-muted-foreground">编辑后保存即可发布，状态切换为“已发布”会自动记录上线时间。</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium">标题</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="输入文章标题"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">摘要</label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="简短说明文章主旨"
                value={form.summary}
                onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">正文</label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="正文支持纯文本"
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                required
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">状态</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as BlogPost["status"] }))}
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "保存中..." : "保存"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                新建
              </button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </section>

        <section className="w-full rounded-xl border bg-white p-6 shadow-sm lg:w-1/2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">文章列表</h2>
              <p className="text-sm text-muted-foreground">草稿与已发布都会显示，点击编辑快速更新。</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{posts.length} 篇</span>
          </div>

          <div className="mt-4 space-y-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="cursor-pointer rounded-lg border px-4 py-3 transition hover:border-primary"
                onClick={() => startEdit(post)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{post.slug}</p>
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      post.status === "published"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {post.status === "published" ? "已发布" : "草稿"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{post.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
