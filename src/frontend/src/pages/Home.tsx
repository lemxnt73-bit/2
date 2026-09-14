import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListings } from "@/hooks/useListings";
import {
  type Category,
  categoryLabel,
  formatPrice,
  timestampToDate,
} from "@/types";
import { useSearch } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PackageSearch } from "lucide-react";

function categoryFromString(value: string) {
  if (value === "bbGun") return "bbGun" as Category;
  if (value === "equipment") return "equipment" as Category;
  return null;
}

export default function Home() {
  const { q, category } = useSearch({ from: "/" });
  const categoryFilter = categoryFromString(category);
  const {
    data: listings,
    isLoading,
    isError,
  } = useListings(categoryFilter, q || null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <CategoryFilter active={category} />
      </div>

      {isError ? (
        <div
          data-ocid="home.error_state"
          className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center"
        >
          <PackageSearch className="mb-3 size-10 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">
            ไม่สามารถโหลดรายการประกาศได้
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            กรุณาลองใหม่อีกครั้งในภายหลัง
          </p>
        </div>
      ) : isLoading ? (
        <div
          data-ocid="home.loading_state"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <div
          data-ocid="home.list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {listings.map((listing, index) => {
            const date = timestampToDate(listing.createdAt);
            return (
              <Link
                key={listing.id.toString()}
                to="/listings/$id"
                params={{ id: listing.id.toString() }}
                data-ocid={`home.item.${index + 1}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-elevated"
              >
                <div className="aspect-square w-full overflow-hidden bg-muted">
                  {listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      ไม่มีรูปภาพ
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground">
                    {listing.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-md bg-accent px-2 py-0.5 text-sm font-bold text-accent-foreground">
                      {formatPrice(listing.price)}
                    </span>
                    <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {categoryLabel(listing.category)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {listing.sellerName.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{listing.sellerName}</span>
                    {date && (
                      <span className="ml-auto shrink-0 text-xs">
                        {date.toLocaleDateString("th-TH")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          data-ocid="home.empty_state"
          className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center"
        >
          <PackageSearch className="mb-3 size-10 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">
            ยังไม่มีประกาศในหมวดนี้
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            เป็นคนแรกที่ลงประกาศขายปืนบีบีกันหรืออุปกรณ์มือสองของคุณ
          </p>
          <Button
            data-ocid="home.empty_cta"
            asChild
            className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link to="/listings/new">ลงประกาศ +</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
