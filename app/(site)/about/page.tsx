import type { Metadata } from "next";
import About from "@/views/About";

export const metadata: Metadata = {
  title: "About",
  description: "Developer profile, experience, skills, and certifications.",
};

export default function AboutPage() {
  return <About />;
}
