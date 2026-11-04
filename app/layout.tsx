import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus LOL — Prompt Chain Lab",
  description: "Create, test, and inspect AI prompt pipelines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
