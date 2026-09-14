import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quzzy — The Ultimate Interactive Quiz Platform",
  description: "Create, import, share, and play quizzes instantly. Real-time Firestore sync with localized offline progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
