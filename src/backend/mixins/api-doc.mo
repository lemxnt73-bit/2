mixin () {
  public query func getApiDoc() : async Text {
    "# BB Gun Marketplace — Backend API

A marketplace for selling BB guns and second-hand airsoft equipment. Anyone can
sign in and post listings to sell. Listings fall into two categories:
`bbGun` (จำหน่าย บีบีกัน) and `equipment` (อุปกรณ์ (มือ2)).

## Public methods

### Authorization (from MixinAuthorization)

- `_internet_identity_sign_in_start() : async Blob` — update. Begins an
  Internet Identity sign-in challenge. Returns a challenge blob.
- `_internet_identity_sign_in_finish() : async Result<(), Verify.Error>` —
  update, signed-in caller. Completes the sign-in and registers the caller.
- `_initialize_access_control() : async ()` — update, signed-in caller.
  Registers the caller in the access-control system. The first non-anonymous
  caller to register becomes `#admin`; every later caller becomes `#user`.
- `getCallerUserRole() : async UserRole` — query, signed-in caller. Returns the
  caller's role (`#admin`, `#user`, or `#guest` for anonymous callers).
- `assignCallerUserRole(user : Principal, role : UserRole) : async ()` —
  update, admin-only. Assigns a role to another principal. Traps with
  \"Unauthorized: Only admins can assign user roles\" if the caller is not an
  admin.
- `isCallerAdmin() : async Bool` — query, signed-in caller. Returns whether the
  caller is an admin.

### Listings

- `createListing(title, category, price, description, images, sellerName) :
  async Result<Listing, ListingError>` — update, signed-in caller with `#user`
  role or higher. Creates a listing owned by the caller. Traps with
  \"Unauthorized: Only signed-in users can create listings\" if the caller lacks
  the `#user` permission.
- `updateListing(id, title, category, price, description, images) :
  async Result<Listing, ListingError>` — update, signed-in caller. Updates a
  listing only if the caller is its seller. Returns `#err(#notFound(id))` if the
  listing does not exist, or `#err(#notAuthorized)` if the caller is not the
  seller.
- `deleteListing(id) : async Result<(), ListingError>` — update, signed-in
  caller. Deletes a listing only if the caller is its seller. Returns
  `#err(#notFound(id))` or `#err(#notAuthorized)` as above.
- `getListing(id) : async ?Listing` — query. Returns the listing with the given
  id, or `null` if it does not exist.
- `listListings(category : ?Category, keyword : ?Text) : async [Listing]` —
  query. Returns all listings, optionally filtered by category and by a
  case-insensitive keyword matched against title and description.
- `getSellerContact(id) : async ?SellerContact` — query. Returns the seller's
  principal and display name for a listing, or `null` if the listing does not
  exist.

### Data Intelligence (OQL)

- `schema() : async Text` — query. Returns the OQL schema describing the
  queryable `listing` entity.
- `execute(query : Text) : async Text` — query. Executes an OQL query against
  the `listing` entity.

## Authentication and authorization

The app uses Internet Identity. Anonymous callers are treated as guests
(`#guest`). A caller must be registered before calling role-guarded endpoints.

Registration happens only when a caller signs in through the app's own
frontend: `_internet_identity_sign_in_finish` (or `_initialize_access_control`)
registers the caller. The first non-anonymous caller to register becomes
`#admin`; every subsequent caller becomes `#user`. A principal that never
signed in through the frontend is unregistered even if it belongs to the app's
owner.

On guarded endpoints, an unregistered non-anonymous caller traps with
\"User is not registered\" (raised by `getUserRole` inside the permission
check). An anonymous caller on `createListing` traps with \"Unauthorized: Only
signed-in users can create listings\". `getCallerUserRole` returns `#guest` for
anonymous callers and traps with \"User is not registered\" for unregistered
non-anonymous callers.

The frontend pins an Internet Identity derivation origin, published at
`/.well-known/ii-derivation-origin` when available. An agent already holding
the user's Internet Identity authorization derives the correct per-app
principal against that origin, for example
`icp identity link web <name> --app <host>`. Such a delegation acts with the
user's full authority in this app until it expires. A signed-in caller derived
against a different origin is a different principal than the one the frontend
registered.

## Units and encodings

- `id` — `Nat`, the listing's unique identifier, assigned sequentially.
- `price` — `Nat`, the listing price in the marketplace's currency unit (no
  decimals).
- `createdAt` / `updatedAt` — `Int`, Unix time in nanoseconds since the epoch.
- `images` — `[Text]`, object-storage references to the listing's images.
- `category` — variant `#bbGun` or `#equipment`.
- `seller` — `Principal`, the seller's identity.
- `sellerName` — `Text`, the seller's display name.
- `ListingError` — variant `#notFound : Nat` or `#notAuthorized`.

## Lifecycle and polling

Listings are created, updated, and deleted directly. There is no asynchronous
lifecycle or polling. `getListing` / `listListings` reflect committed state
immediately after the corresponding update completes.

## Mutation retry safety

- `createListing` is not idempotent: each successful call creates a new listing
  with a fresh id. Retrying a create produces a duplicate listing.
- `updateListing` and `deleteListing` are idempotent with respect to a given
  listing id: updating applies the new values, deleting removes the listing.
  Repeating a delete after success returns `#err(#notFound(id))`.
- `deleteListing` is destructive and irreversible.

## Errors, traps, limits

- `createListing` traps for callers without the `#user` permission.
- `updateListing` / `deleteListing` return `#err` variants rather than trapping
  for missing listings or non-owner callers.
- `assignCallerUserRole` traps for non-admin callers.
- `getCallerUserRole` and permission checks trap with \"User is not registered\"
  for unregistered non-anonymous callers.
- The `listing` OQL entity is `public_`: anyone, including anonymous callers,
  can read all listings through `schema()` / `execute()`.
"
  };
};
