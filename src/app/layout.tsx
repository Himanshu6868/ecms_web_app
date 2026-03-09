import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Ticket Management System",
  description: "Enterprise Ticket Management Dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
