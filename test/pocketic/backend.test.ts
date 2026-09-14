import { createIdentity, PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

// Two distinct non-anonymous principals. The first to call
// `_initialize_access_control` becomes admin; the second becomes a regular user.
// Derived from `@dfinity/pic`'s `createIdentity` (which is resolvable from this
// lane) rather than importing `@icp-sdk/core/principal` directly, because that
// package is only installed under `src/frontend/node_modules` and is not
// resolvable from `app/test/pocketic/`.
const ADMIN = createIdentity("admin-seed").getPrincipal();
const OTHER = createIdentity("other-seed").getPrincipal();

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
    sender: ADMIN,
  }));
  // The actor's calls default to the anonymous principal unless setPrincipal is
  // used, so register ADMIN explicitly before initializing access control.
  // Otherwise `_initialize_access_control` runs as anonymous and ADMIN is never
  // registered, and createListing's signed-in check rejects every caller.
  actor.setPrincipal(ADMIN);
  await actor._initialize_access_control();
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far.
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listListings([], [])).resolves.toEqual([]);
});

it("round-trips a listing through the real canister", async () => {
  const result = await actor.createListing(
    "Tokyo Marui HK416D",
    { bbGun: null },
    12800n,
    "สภาพดี",
    ["https://example.com/a.jpg"],
    "สมชาย",
  );
  expect(result).toHaveProperty("ok");
  if (!("ok" in result)) throw new Error("expected ok");
  const created = result.ok;
  expect(created.title).toBe("Tokyo Marui HK416D");
  expect(created.seller.toString()).toBe(ADMIN.toString());

  const fetched = await actor.getListing(created.id);
  expect(fetched).toEqual([created]);

  const all = await actor.listListings([], []);
  expect(all).toContainEqual(created);
});

it("filters listings by category", async () => {
  await actor.createListing("ปืนบีบีกัน A", { bbGun: null }, 1000n, "", [], "ผู้ขาย");
  await actor.createListing("อุปกรณ์มือสอง B", { equipment: null }, 500n, "", [], "ผู้ขาย");

  const bbGun = await actor.listListings([{ bbGun: null }], []);
  expect(bbGun.every((l) => "bbGun" in l.category)).toBe(true);
  expect(bbGun.some((l) => l.title === "ปืนบีบีกัน A")).toBe(true);
  expect(bbGun.some((l) => l.title === "อุปกรณ์มือสอง B")).toBe(false);

  const equipment = await actor.listListings([{ equipment: null }], []);
  expect(equipment.every((l) => "equipment" in l.category)).toBe(true);
  expect(equipment.some((l) => l.title === "อุปกรณ์มือสอง B")).toBe(true);
});

it("searches listings by keyword", async () => {
  const matches = await actor.listListings([], ["hk416"]);
  expect(matches.length).toBeGreaterThan(0);
  expect(matches.every((l) => l.title.toLowerCase().includes("hk416"))).toBe(true);
});

it("returns seller contact for a listing", async () => {
  const all = await actor.listListings([], []);
  const target = all[0];
  const contact = await actor.getSellerContact(target.id);
  expect(contact).toEqual([{ seller: target.seller, sellerName: target.sellerName }]);
});

it("lets the owner update their own listing", async () => {
  const result = await actor.createListing("แก้ไขได้", { bbGun: null }, 100n, "", [], "เจ้าของ");
  if (!("ok" in result)) throw new Error("expected ok");
  const id = result.ok.id;

  const updated = await actor.updateListing(id, "แก้ไขแล้ว", { equipment: null }, 200n, "ใหม่", []);
  expect(updated).toHaveProperty("ok");
  if (!("ok" in updated)) throw new Error("expected ok");
  expect(updated.ok.title).toBe("แก้ไขแล้ว");
  expect("equipment" in updated.ok.category).toBe(true);
});

it("lets the owner delete their own listing", async () => {
  const result = await actor.createListing("จะลบ", { bbGun: null }, 50n, "", [], "เจ้าของ");
  if (!("ok" in result)) throw new Error("expected ok");
  const id = result.ok.id;

  await expect(actor.deleteListing(id)).resolves.toEqual({ ok: null });
  await expect(actor.getListing(id)).resolves.toEqual([]);
});

it("rejects another user updating or deleting someone else's listing", async () => {
  // Register OTHER as a regular user (admin already assigned).
  actor.setPrincipal(OTHER);
  await actor._initialize_access_control();

  const result = await actor.createListing("ของคนอื่น", { bbGun: null }, 300n, "", [], "คนอื่น");
  if (!("ok" in result)) throw new Error("expected ok");
  const id = result.ok.id;

  // OTHER owns this listing, so OTHER can update/delete it.
  await expect(actor.updateListing(id, "ของตัวเอง", { bbGun: null }, 301n, "", [])).resolves.toHaveProperty("ok");

  // ADMIN does not own it, so ADMIN is rejected.
  actor.setPrincipal(ADMIN);
  const deniedUpdate = await actor.updateListing(id, "แย่ง", { bbGun: null }, 999n, "", []);
  expect(deniedUpdate).toHaveProperty("err");
  if ("err" in deniedUpdate) expect("notAuthorized" in deniedUpdate.err).toBe(true);

  const deniedDelete = await actor.deleteListing(id);
  expect(deniedDelete).toHaveProperty("err");
  if ("err" in deniedDelete) expect("notAuthorized" in deniedDelete.err).toBe(true);
});
