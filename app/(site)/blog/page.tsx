import type { Metadata } from "next";
import Blog from "@/views/Blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical articles about web development, security, and programming.",
};

export default function BlogPage() {
  return <Blog />;
}
