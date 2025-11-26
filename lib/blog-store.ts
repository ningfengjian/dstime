import fs from "fs/promises";
import path from "path";

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "blog-posts.json");

async function ensureStore() {
  try {
    await fs.access(DATA_PATH);
  } catch (error) {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

export async function getAllPosts(includeDrafts = false): Promise<BlogPost[]> {
  await ensureStore();
  const content = await fs.readFile(DATA_PATH, "utf8");
  const posts = JSON.parse(content) as BlogPost[];
  const filtered = includeDrafts ? posts : posts.filter((post) => post.status === "published");
  return filtered.sort((a, b) => {
    const aDate = a.publishedAt ?? a.updatedAt;
    const bDate = b.publishedAt ?? b.updatedAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts(true);
  return posts.find((post) => post.slug === slug);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

async function persist(posts: BlogPost[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(posts, null, 2), "utf8");
}

function ensurePublishedAt(status: BlogStatus, currentPublishedAt?: string) {
  if (status === "published") {
    return currentPublishedAt ?? new Date().toISOString();
  }
  return undefined;
}

export async function createPost(input: Omit<BlogPost, "slug" | "createdAt" | "updatedAt"> & { slug?: string }) {
  const posts = await getAllPosts(true);
  const now = new Date().toISOString();
  const baseSlug = input.slug?.length ? slugify(input.slug) : slugify(input.title);
  let slug = baseSlug;
  let counter = 1;

  while (posts.some((post) => post.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const newPost: BlogPost = {
    ...input,
    slug,
    createdAt: now,
    updatedAt: now,
    publishedAt: ensurePublishedAt(input.status, input.publishedAt),
  };

  posts.push(newPost);
  await persist(posts);
  return newPost;
}

export async function updatePost(slug: string, updates: Partial<Omit<BlogPost, "slug" | "createdAt">>) {
  const posts = await getAllPosts(true);
  const targetIndex = posts.findIndex((post) => post.slug === slug);

  if (targetIndex === -1) {
    return undefined;
  }

  const original = posts[targetIndex];
  const updated: BlogPost = {
    ...original,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  updated.publishedAt = ensurePublishedAt(updated.status, updated.publishedAt ?? original.publishedAt);

  posts[targetIndex] = updated;
  await persist(posts);
  return updated;
}
