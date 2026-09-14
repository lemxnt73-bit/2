import { Header } from "@/components/Header";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            className="underline underline-offset-2 hover:text-foreground"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
