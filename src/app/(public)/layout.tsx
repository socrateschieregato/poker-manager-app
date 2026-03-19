import Link from "next/link";
import { Spade } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Spade className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Poker Rankings</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Ranking
            </Link>
            <Link href="/ranking" className="text-muted-foreground hover:text-foreground transition-colors">
              Temporadas
            </Link>
            <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Poker Rankings &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
