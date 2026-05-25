import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/tg/sw-register";
import { PushPrompt } from "@/components/tg/push-prompt";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const sans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Timegift — Give someone your time",
  description:
    "Not a thing you bought. A morning. A long walk. The whole of next Sunday. Write it down, send it across, and mean it.",
  keywords: ["time gift", "personal gift", "scheduling", "quality time", "letters", "memories"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Timegift",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
  openGraph: {
    title: "Timegift — Give someone your time",
    description: "A small, deliberate way to send a morning, a long walk, the whole of next Sunday.",
    type: "website",
    siteName: "Timegift",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timegift — Give someone your time",
    description: "A small, deliberate way to send a morning, a long walk, the whole of next Sunday.",
  },
};

export const viewport: Viewport = {
  themeColor: "#a8501e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
        <div id="app" style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
          {children}
        </div>
        <ServiceWorkerRegister />
        <PushPrompt />
      </body>
    </html>
  );
}
