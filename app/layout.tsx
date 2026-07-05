import type { Metadata } from "next";
import { Alexandria, Readex_Pro } from "next/font/google";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/firebase/auth-context";
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
        {/*
         * Radix's Select/Tabs/DropdownMenu read `dir` from React context, not
         * from the DOM — without this provider they default to LTR internal
         * behavior (arrow-key navigation, side flipping) even though the page
         * is visually RTL. This sets the app-wide default to RTL; a component
         * can still override with its own explicit `dir` prop (e.g. the
         * /showcase locale toggle passes `dir` per-instance intentionally).
         */}
        <DirectionProvider dir="rtl">
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
