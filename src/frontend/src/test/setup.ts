import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import { vi } from "vitest";

// Generated components use `data-ocid` as their test id attribute.
configure({ testIdAttribute: "data-ocid" });

// The app's `main.tsx` patches BigInt so React Query can hash query keys that
// contain bigints (e.g. `["listing", id]`). Tests render `<App />` directly and
// skip `main.tsx`, so apply the same patch here or query-key hashing throws
// "Do not know how to serialize a BigInt".
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// The `@caffeineai/object-storage` package ships ESM with extensionless
// relative imports that Vitest's node resolver cannot follow. The app's
// generated `@/backend` module imports `ExternalBlob` from it, so mock the
// module to keep the suite from loading the broken package. Tests never
// exercise real blob uploads.
vi.mock("@caffeineai/object-storage", () => {
  class ExternalBlob {
    static fromBytes() {
      return new ExternalBlob();
    }
    getDirectURL() {
      return "https://example.com/blob";
    }
    withUploadProgress() {}
  }
  return { ExternalBlob };
});
