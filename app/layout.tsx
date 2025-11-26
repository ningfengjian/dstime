import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Discord Timestamp Generator",
  description: "Generate Discord timestamps with timezone-aware previews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-lg font-semibold text-gray-900">
                dstime
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/" className="transition hover:text-primary">
                  Home
                </Link>
                <Link href="/about" className="transition hover:text-primary">
                  About
                </Link>
                <Link href="/blog" className="transition hover:text-primary">
                  Blog
                </Link>
                <Link href="/blog/admin" className="transition hover:text-primary">
                  Admin
                </Link>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
