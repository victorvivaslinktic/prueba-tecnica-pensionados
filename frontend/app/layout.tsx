import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TransitionProvider from "./transition-provider";
import Header from "@/components/general/header";
import Footer from "@/components/general/footer";

export const metadata: Metadata = {
  title: "Prueba tecnica LinkTIC",
  description: "Prueba tecnica LinkTIC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-background text-foreground"
      >
        <Header />
        <TransitionProvider>{children}</TransitionProvider>
        <Footer />
      </body>
    </html>
  );
}
