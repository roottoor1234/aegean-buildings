import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "greek"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ψηφιακή Ταυτότητα Κτιρίου | Πανεπιστήμιο Αιγαίου",
  description:
    "Μόνιμα QR codes που ανοίγουν σελίδες κτιρίων του Πανεπιστημίου Αιγαίου. Ενημέρωση περιεχομένου χωρίς επανεκτύπωση.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body className={`${display.variable} ${sans.variable} antialiased min-h-screen`}>{children}</body>
    </html>
  );
}
