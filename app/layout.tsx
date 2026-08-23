import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weilies Chok — Product Manager, Integration & Platform Strategy",
  description:
    "Weilies Chok. Senior Product Manager at BIPO, leading integration strategy across a global HRMS, EOR, and GPO platform serving 5,500+ clients in 170+ countries.",
  openGraph: {
    title: "Weilies Chok — Product Manager, Integration & Platform Strategy",
    description:
      "Senior Product Manager at BIPO. Integration strategy for a global HRMS, EOR, and GPO platform.",
    url: "https://nextnovas.com",
    siteName: "nextnovas",
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
