import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weilies Chok — Product Manager & Indie Game Builder",
  description:
    "Weilies Chok. Product Manager by day, building Nexus Arcade — retro-neon browser games — by night.",
  openGraph: {
    title: "Weilies Chok — Product Manager & Indie Game Builder",
    description:
      "PM by day. Nexus Arcade by night. Retro-neon browser games.",
    url: "https://next-novas.com",
    siteName: "next-novas",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono antialiased min-h-screen">{children}</body>
    </html>
  );
}
