import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Plus, Search } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    navigate({ to: "/", search: { q: query, category: "" } });
  };

  const handleAuth = () => {
    if (isAuthenticated) {
      clear();
      queryClient.clear();
    } else {
      login();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card shadow-subtle">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4">
        <Link
          to="/"
          search={{ q: "", category: "" }}
          data-ocid="header.brand"
          className="flex shrink-0 items-center gap-2 font-display text-base font-bold tracking-tight text-foreground sm:text-lg"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            BB
          </span>
          <span className="hidden sm:inline">แอร์ซอฟท์ ไทยแลนด์</span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          <Link
            to="/"
            search={{ q: "", category: "" }}
            data-ocid="header.nav.home"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            หน้าแรก
          </Link>
        </nav>

        <div className="flex min-w-0 flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-ocid="header.search_input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="ค้นหาปืนบีบีกัน อุปกรณ์..."
              className="pl-9"
              aria-label="ค้นหา"
            />
          </div>
        </div>

        <Button
          data-ocid="header.post_button"
          onClick={() => navigate({ to: "/listings/new" })}
          className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus />
          <span className="hidden sm:inline">ลงประกาศ</span>
        </Button>

        <Button
          data-ocid="header.auth_button"
          onClick={handleAuth}
          disabled={isInitializing || isLoggingIn}
          variant="outline"
          className="shrink-0"
        >
          {isAuthenticated ? <LogOut /> : <LogIn />}
          <span className="hidden sm:inline">
            {isAuthenticated ? "ออกจากระบบ" : "เข้าสู่ระบบ"}
          </span>
        </Button>
      </div>
    </header>
  );
}
