import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LayoutClient } from "@/components/layout-client";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Meikural - Online Coding Platform for Learning & Practice",
  description:
    "Master programming languages with Meikural's interactive coding platform. Practice Python, Java, C, and C++ with real-time code execution, instant feedback, and comprehensive test cases. Perfect for students, educators, and coding enthusiasts.",
  keywords: [
    "coding platform",
    "online code editor",
    "programming practice",
    "coding challenges",
    "Python practice",
    "Java tutorials",
    "code execution",
    "programming education",
    "online IDE",
    "coding assignments",
    "code testing",
    "programming learning",
    "algorithm practice",
    "coding lessons",
    "edtech",
  ],
  authors: [{ name: "Meikural" }],
  creator: "Meikural",
  publisher: "Meikural",
  metadataBase: new URL("https://meikural.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meikural.app",
    title: "Meikural - Online Coding Platform for Learning & Practice",
    description:
      "Learn and practice coding with Meikural. Execute code instantly, test your solutions against multiple test cases, and improve your programming skills across Python, Java, C, and C++.",
    siteName: "Meikural",
    images: [
      {
        url: "/img/logo.png",
        width: 1200,
        height: 630,
        alt: "Meikural - Online Coding Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meikural - Online Coding Platform for Learning & Practice",
    description:
      "Practice coding with instant execution and test case validation. Learn Python, Java, C, and C++ through interactive programming challenges.",
    images: ["/img/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {},
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={firaSans.variable}>
        <LayoutClient>{children}</LayoutClient>
        <Toaster />
      </body>
    </html>
  );
}
