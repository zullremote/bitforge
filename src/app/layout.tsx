import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BitForge Exchange | BTC/USDT",
  description: "Simulation-only Bitcoin exchange prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
