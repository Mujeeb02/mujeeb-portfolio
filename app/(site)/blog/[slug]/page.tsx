import type { Metadata } from "next";
import BlogPostPage from "@/views/BlogPost";

type Props = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Article",
};

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} />;
}
