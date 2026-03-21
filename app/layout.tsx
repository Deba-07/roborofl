import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";

export const metadata: Metadata = {
  title: "Roborofl | India's Meme Amplification Network",
  description:
    "Connect your brand with India's most culturally sharp meme pages. Curated, verified, activated in 48 hours.",
  openGraph: {
    title: "Roborofl | India's Meme Amplification Network",
    description:
      "Connect your brand with India's most culturally sharp meme pages. Curated, verified, activated in 48 hours.",
    url: "https://roborofl.com",
    siteName: "Roborofl",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roborofl | India's Meme Amplification Network",
    description: "Curated meme pages. Verified. Activated in 48 hours.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}