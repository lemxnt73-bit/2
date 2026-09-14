import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateListing,
  useListing,
  useUpdateListing,
} from "@/hooks/useListings";
import { BB_GUN, type Category, EQUIPMENT } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ExternalBlob } from "@caffeineai/object-storage";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ListingForm() {
  const params = useParams({ strict: false });
  const id = params.id;
  const isEdit = Boolean(id);
  const { isAuthenticated } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: existing } = useListing(id ? BigInt(id) : 0n);
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(BB_GUN);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // One-time initialization when editing an existing listing.
  useEffect(() => {
    if (isEdit && existing) {
      setTitle(existing.title);
      setCategory(existing.category);
      setPrice(existing.price.toString());
      setDescription(existing.description);
      setSellerName(existing.sellerName);
      setImages(existing.images);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, existing]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        const blob = ExternalBlob.fromBytes(bytes, file.type, file.name);
        const url = blob.getDirectURL();
        setUploadProgress((prev) => ({ ...prev, [url]: 0 }));
        setImages((prev) => [...prev, url]);
        blob.withUploadProgress((pct) => {
          setUploadProgress((prev) => ({ ...prev, [url]: pct }));
        });
      };
      reader.readAsArrayBuffer(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const priceNum = Number(price);
  const canSubmit =
    title.trim().length > 0 &&
    price.trim().length > 0 &&
    !Number.isNaN(priceNum) &&
    priceNum > 0 &&
    sellerName.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      title: title.trim(),
      category,
      price: BigInt(Math.round(priceNum)),
      description: description.trim(),
      images,
    };
    if (isEdit && id) {
      updateMutation.mutate(
        { id: BigInt(id), ...payload },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") {
              navigate({ to: "/listings/$id", params: { id } });
            }
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, sellerName: sellerName.trim() },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") {
              navigate({
                to: "/listings/$id",
                params: { id: result.ok.id.toString() },
              });
            }
          },
        },
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-xl font-semibold">กรุณาเข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          คุณต้องเข้าสู่ระบบก่อนจึงจะลงประกาศขายได้
        </p>
        <Button
          data-ocid="listing.login_button"
          asChild
          className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link to="/" search={{ q: "", category: "" }}>
            กลับไปหน้าแรก
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button
        asChild
        variant="ghost"
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <Link to="/" search={{ q: "", category: "" }}>
          <ArrowLeft /> กลับไปหน้าแรก
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-bold">
        {isEdit ? "แก้ไขประกาศ" : "ลงประกาศขาย"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEdit ? "แก้ไขข้อมูลประกาศของคุณ" : "กรอกข้อมูลสินค้าที่ต้องการขาย"}
      </p>

      <div className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="title">ชื่อสินค้า</Label>
          <Input
            id="title"
            data-ocid="listing.title_input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น Tokyo Marui HK416D NGRS"
          />
        </div>

        <div className="space-y-2">
          <Label>หมวดหมู่</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: BB_GUN, label: "จำหน่าย บีบีกัน" },
              { value: EQUIPMENT, label: "อุปกรณ์ (มือ2)" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-ocid={`listing.category.${opt.value}`}
                onClick={() => setCategory(opt.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === opt.value
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">ราคา (บาท)</Label>
          <Input
            id="price"
            data-ocid="listing.price_input"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="เช่น 12800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">รายละเอียด</Label>
          <Textarea
            id="description"
            data-ocid="listing.description_input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="สภาพสินค้า อุปกรณ์ที่แถม วิธีการจัดส่ง..."
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label>รูปภาพสินค้า</Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((url) => {
              const progress = uploadProgress[url] ?? 100;
              const isUploading = progress < 100;
              return (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <img
                    src={url}
                    alt="รูปสินค้า"
                    className="size-full object-cover"
                    onLoad={() =>
                      setUploadProgress((prev) => ({ ...prev, [url]: 100 }))
                    }
                  />
                  {isUploading && (
                    <div
                      data-ocid="listing.upload_progress"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-2"
                    >
                      <Progress value={progress} className="w-full" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    data-ocid="listing.remove_image_button"
                    aria-label="ลบรูปภาพ"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-foreground/70 text-background opacity-0 transition-opacity hover:bg-foreground group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              data-ocid="listing.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ImagePlus className="size-6" />
              <span className="text-xs">เพิ่มรูป</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="text-xs text-muted-foreground">
            รองรับไฟล์ภาพ JPG, PNG, WebP
          </p>
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="sellerName">ชื่อผู้ขาย</Label>
            <Input
              id="sellerName"
              data-ocid="listing.seller_name_input"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="ชื่อที่แสดงบนประกาศ"
            />
          </div>
        )}

        <Button
          data-ocid="listing.submit_button"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isPending && <Loader2 className="animate-spin" />}
          {isEdit ? "บันทึกการแก้ไข" : "ลงประกาศ"}
        </Button>

        {(createMutation.isError || updateMutation.isError) && (
          <p
            data-ocid="listing.error_state"
            className="text-sm text-destructive"
          >
            เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง
          </p>
        )}
      </div>
    </div>
  );
}
