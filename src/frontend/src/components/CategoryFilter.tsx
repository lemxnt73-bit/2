import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { key: "", label: "ทั้งหมด" },
  { key: "bbGun", label: "จำหน่าย บีบีกัน" },
  { key: "equipment", label: "อุปกรณ์ (มือ2)" },
];

interface CategoryFilterProps {
  active: string;
}

export function CategoryFilter({ active }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.key}
          to="/"
          search={{ q: "", category: cat.key }}
          data-ocid={`category.filter.${cat.key || "all"}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            active === cat.key
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
