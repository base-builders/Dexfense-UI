import type { Metadata } from "next";
import { Press_Start_2P, Quantico } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/widgets/navbar/ui/navbar";
import "./globals.css";

const quantico = Quantico({
  variable: "--font-quantico",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const pressStart2P = Press_Start_2P({
  variable: "--font-start-2p",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Dexfense Protocol",
  description: "Experience the Most Intuitive DeFi",
  openGraph: {
    title: "DexFense Protocol",
    description: "Experience the Most Intuitive DeFi",
    url: "http://134.185.109.88:3000/",
    siteName: "DexFense Protocol",
    images: [{ url: "http://134.185.109.88:3000/assets/thumbnail.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-black min-h-screen w-screen relative flex flex-col ${pressStart2P.variable} ${quantico.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
