import type { Category, Listing, SellerContact } from "@/types";
import { Principal } from "@icp-sdk/core/principal";

export const SELLER_PRINCIPAL = Principal.fromText(
  "ryjl3-tyaaa-aaaaa-aaaba-cai",
);
export const OTHER_PRINCIPAL = Principal.fromText(
  "renrk-eyaaa-aaaaa-aaada-cai",
);

export function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 1n,
    title: "Tokyo Marui HK416D",
    category: "bbGun" as Category,
    price: 12800n,
    description: "สภาพดี ใช้งานน้อย",
    images: ["https://example.com/a.jpg"],
    seller: SELLER_PRINCIPAL,
    sellerName: "สมชาย",
    createdAt: 1700000000000000000n,
    updatedAt: 1700000000000000000n,
    ...overrides,
  };
}

export function makeSellerContact(
  overrides: Partial<SellerContact> = {},
): SellerContact {
  return {
    seller: SELLER_PRINCIPAL,
    sellerName: "สมชาย",
    ...overrides,
  };
}
