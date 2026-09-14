import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result = {
    __kind__: "ok";
    ok: Listing;
} | {
    __kind__: "err";
    err: ListingError;
};
export interface Listing {
    id: bigint;
    title: string;
    createdAt: bigint;
    description: string;
    seller: Principal;
    sellerName: string;
    updatedAt: bigint;
    category: Category;
    price: bigint;
    images: Array<string>;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ListingError;
};
export type ListingError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "notFound";
    notFound: bigint;
};
export interface SellerContact {
    seller: Principal;
    sellerName: string;
}
export enum Category {
    equipment = "equipment",
    bbGun = "bbGun"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, category: Category, price: bigint, description: string, images: Array<string>, sellerName: string): Promise<Result>;
    deleteListing(id: bigint): Promise<Result_1>;
    execute(qJson: string): Promise<Result__1>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: bigint): Promise<Listing | null>;
    getSellerContact(id: bigint): Promise<SellerContact | null>;
    isCallerAdmin(): Promise<boolean>;
    listListings(category: Category | null, keyword: string | null): Promise<Array<Listing>>;
    schema(): Promise<string>;
    updateListing(id: bigint, title: string, category: Category, price: bigint, description: string, images: Array<string>): Promise<Result>;
}
