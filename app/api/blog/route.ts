import { NextResponse } from "next/server";
import { createPost, getAllPosts } from "@/lib/blog-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("includeDrafts") === "1";
  const posts = await getAllPosts(includeDrafts);
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, content, status, slug } = body;

    if (!title || !summary || !content || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!["draft", "published"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const post = await createPost({
      title,
      summary,
      content,
      status,
      slug,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create post." }, { status: 500 });
  }
}
