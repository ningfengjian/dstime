import { NextResponse } from "next/server";
import { getPostBySlug, updatePost } from "@/lib/blog-store";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    const { title, summary, content, status } = body;

    if (status && !["draft", "published"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const post = await updatePost(params.slug, {
      title,
      summary,
      content,
      status,
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update post." }, { status: 500 });
  }
}
