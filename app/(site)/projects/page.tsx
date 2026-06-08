import type { Metadata } from "next";
import Projects from "@/views/Projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open source projects, experiments, reviews, and technical work.",
};

export default function ProjectsPage() {
  return <Projects />;
}
