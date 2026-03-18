import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muscle War Fitness — Management",
  description: "Smart gym membership tracker with payment & expiry management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
