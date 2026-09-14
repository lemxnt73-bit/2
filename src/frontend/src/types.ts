import type {
  Listing,
  ListingError,
  Result,
  Result_1,
  SellerContact,
} from "@/backend";
import { Category } from "@/backend";

export type { Category, Listing, ListingError, SellerContact };

/** Result of creating or updating a listing. */
export type ListingResult = Result;

/** Result of deleting a listing. */
export type DeleteResult = Result_1;

/**
 * Product category. Mirrors the backend Motoko variant `{ #bbGun; #equipment }`.
 * - bbGun    -> จำหน่าย บีบีกัน
 * - equipment -> อุปกรณ์ (มือ2)
 */
export const BB_GUN: Category = Category.bbGun;
export const EQUIPMENT: Category = Category.equipment;

export const CATEGORY_LABELS: Record<string, string> = {
  bbGun: "จำหน่าย บีบีกัน",
  equipment: "อุปกรณ์ (มือ2)",
};

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] ?? "อื่นๆ";
}

/** Convert a backend nanosecond timestamp to a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a price (in baht) as a Thai currency string. */
export function formatPrice(price: bigint): string {
  return `฿${Number(price).toLocaleString("th-TH")}`;
}
