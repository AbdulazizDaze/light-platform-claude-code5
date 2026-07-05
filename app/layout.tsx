import type { Metadata } from "next";
import { Alexandria, Readex_Pro } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لايت | Light",
  description:
    "لايت — منصة توظيف ذكية تحادثك بالعربي وتبني سيرتك الذاتية وتوصلك بالفرصة المناسبة. Light is a conversational, bilingual AI recruitment platform for Saudi Arabia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="ar" className={`${alexandria.variable} ${readexPro.variable}`}>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
