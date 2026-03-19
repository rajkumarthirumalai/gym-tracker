import type { Metadata } from "next";
import "./globals.css";

import { ClientProviders } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Muscle War Fitness — Management",
  description: "Gym member management and tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
