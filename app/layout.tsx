import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/app-providers";
import "@/index.css";

export const metadata: Metadata = {
  title: {
    default: "Mujeeburrahman | Full Stack Developer",
    template: "%s | Mujeeburrahman",
  },
  description:
    "Cybernetic portfolio, technical blog, project showcase, and admin dashboard for Mujeeburrahman.",
  applicationName: "Cybernetic Journal",
  authors: [{ name: "Mujeeburrahman" }],
  keywords: [
    "Mujeeburrahman",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Portfolio",
    "Technical Blog",
  ],
  metadataBase: new URL("https://cybernetic-journal.local"),
  openGraph: {
    title: "Mujeeburrahman | Full Stack Developer",
    description:
      "Cybernetic portfolio, technical blog, project showcase, and admin dashboard.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00ff00",
};

import { Caveat } from 'next/font/google';

const caveat = Caveat({ 
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={caveat.variable}>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
