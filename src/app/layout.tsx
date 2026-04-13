import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Readiness Assessment | Digital Automations",
  description:
    "Quanto e' pronta la tua azienda per l'AI? 30 domande, 8 minuti. Scopri il tuo livello su 6 aree chiave e verifica la conformita' su 7 obblighi normativi.",
  openGraph: {
    title: "AI Readiness Assessment | Digital Automations",
    description:
      "Quanto e' pronta la tua azienda per l'AI? Quiz gratuito di autovalutazione per PMI.",
    type: "website",
    url: "https://aiassessment.digitalautomations.it",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          async
          src="https://plausible.io/js/pa-ToATiIVt8-S306KREIm2x.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
