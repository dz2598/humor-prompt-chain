import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children, name }: { children: React.ReactNode; name?: string }) {
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand"><b>C//LOL</b><span>PROMPT CHAIN LAB</span></Link>
      <div className="top-actions"><ThemeToggle /><span className="operator">{name || "Superadmin"}</span><LogoutButton /></div>
    </header>
    <main className="main-content">{children}</main>
  </div>;
}
