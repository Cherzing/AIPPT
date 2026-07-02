import type { Metadata } from "next";
import localFont from "next/font/local";
import { Syne, Unbounded } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MixpanelInitializer from "./MixpanelInitializer";
import { Toaster } from "@/components/ui/sonner";
import ChineseLocalizer from "./ChineseLocalizer";
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "AI PPT",
  description: "AI PPT ?????????????",
  keywords: [
    "AI PPT",
    "AI ????",
    "??????",
    "PPT ??",
    "????",
    "AI ???",
  ],
  openGraph: {
    title: "AI PPT",
    description: "AI PPT ?????????????",
    url: "http://localhost:3000",
    siteName: "AI PPT",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 630,
        alt: "AI PPT Logo",
      },
    ],
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "http://localhost:3000",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI PPT",
    description: "AI PPT ?????????????",
    images: ["/Logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${inter.variable} ${syne.variable} ${unbounded.variable} antialiased`}
      >
        <Providers>
          <MixpanelInitializer>
            <ChineseLocalizer />
            {children}
          </MixpanelInitializer>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
