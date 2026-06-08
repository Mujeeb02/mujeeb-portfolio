import type { Metadata } from "next";
import Contact from "@/views/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a project inquiry or collaboration message.",
};

export default function ContactPage() {
  return <Contact />;
}
