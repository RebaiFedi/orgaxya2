import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { TrpcProvider } from "@/lib/trpc/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Journal des Transactions | Orgaxya",
  description: "Application professionnelle de gestion financière et suivi des transactions développée par Fedi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@600..700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${quicksand.variable} font-quicksand antialiased`}>
        <TrpcProvider>
          <ThemeProvider defaultTheme="system" storageKey="finance-theme-mode">
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
