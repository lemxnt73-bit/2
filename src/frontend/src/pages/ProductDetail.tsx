import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useDeleteListing,
  useListing,
  useSellerContact,
} from "@/hooks/useListings";
import { categoryLabel, formatPrice, timestampToDate } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MessageCircle, Trash2 } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams({ from: "/listings/$id" });
  const listingId = BigInt(id);
  const { data: listing, isLoading, isError } = useListing(listingId);
  const { data: sellerContact } = useSellerContact(listingId);
  const { identity, isAuthenticated } = useInternetIdentity();
  const deleteMutation = useDeleteListing();

  if (isLoading) {
    return (
      <div
        data-ocid="detail.loading_state"
        className="mx-auto max-w-5xl px-4 py-8"
      >
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-10 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div
        data-ocid="detail.error_state"
        className="mx-auto max-w-5xl px-4 py-16 text-center"
      >
        <h1 className="font-display text-xl font-semibold">ไม่พบประกาศนี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">ประกาศอาจถูกลบไปแล้ว</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/" search={{ q: "", category: "" }}>
            กลับไปหน้าแรก
          </Link>
        </Button>
      </div>
    );
  }

  const date = timestampToDate(listing.createdAt);
  const isOwner =
    isAuthenticated &&
    identity?.getPrincipal().toString() === listing.seller.toString();

  const handleDelete = () => {
    deleteMutation.mutate(listingId, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          window.location.href = "/";
        }
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Button
        asChild
        variant="ghost"
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <Link to="/" search={{ q: "", category: "" }}>
          <ArrowLeft /> กลับไปหน้าแรก
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center text-muted-foreground">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {categoryLabel(listing.category)}
            </span>
            {date && (
              <span className="text-xs text-muted-foreground">
                ลงประกาศ {date.toLocaleDateString("th-TH")}
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl font-bold">{listing.title}</h1>

          <div className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-2xl font-bold text-accent-foreground">
            {formatPrice(listing.price)}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted font-semibold text-foreground">
              {listing.sellerName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{listing.sellerName}</p>
              <p className="text-xs text-muted-foreground">ผู้ขาย</p>
            </div>
            {!isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    data-ocid="detail.contact_button"
                    variant="outline"
                    className="shrink-0"
                  >
                    <MessageCircle /> ติดต่อผู้ขาย
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="detail.contact_dialog">
                  <DialogHeader>
                    <DialogTitle>ติดต่อผู้ขาย</DialogTitle>
                    <DialogDescription>
                      ติดต่อ {sellerContact?.sellerName ?? listing.sellerName} เพื่อ
                      จัดการซื้อขาย
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted p-4">
                      <span className="flex size-12 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                        {listing.sellerName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {sellerContact?.sellerName ?? listing.sellerName}
                        </p>
                        <p className="break-all font-mono text-xs text-muted-foreground">
                          {sellerContact?.seller.toString() ??
                            listing.seller.toString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ใช้ข้อมูลผู้ขายด้านบนเพื่อติดต่อและนัดหมายการซื้อขายโดยตรง
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-semibold">รายละเอียด</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {listing.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/listings/$id/edit" params={{ id }}>
                  แก้ไขประกาศ
                </Link>
              </Button>
              <Button
                data-ocid="detail.delete_button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="animate-spin" />
                )}
                <Trash2 /> ลบประกาศ
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
