import { createActor } from "@/backend";
import type {
  Category,
  DeleteResult,
  Listing,
  ListingResult,
  SellerContact,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CreateListingInput {
  title: string;
  category: Category;
  price: bigint;
  description: string;
  images: string[];
  sellerName: string;
}

export interface UpdateListingInput {
  id: bigint;
  title: string;
  category: Category;
  price: bigint;
  description: string;
  images: string[];
}

/** Fetch the listing list, optionally filtered by category and keyword. */
export function useListings(category: Category | null, keyword: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listings", category, keyword],
    queryFn: async (): Promise<Listing[]> => {
      if (!actor) return [];
      return actor.listListings(category, keyword);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single listing by id. */
export function useListing(id: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async (): Promise<Listing | null> => {
      if (!actor) return null;
      return actor.getListing(id);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the seller contact channel for a listing. */
export function useSellerContact(id: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sellerContact", id],
    queryFn: async (): Promise<SellerContact | null> => {
      if (!actor) return null;
      return actor.getSellerContact(id);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Create a new listing. */
export function useCreateListing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateListingInput): Promise<ListingResult> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createListing(
        input.title,
        input.category,
        input.price,
        input.description,
        input.images,
        input.sellerName,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

/** Update an existing listing. */
export function useUpdateListing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateListingInput): Promise<ListingResult> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateListing(
        input.id,
        input.title,
        input.category,
        input.price,
        input.description,
        input.images,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

/** Delete a listing. */
export function useDeleteListing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint): Promise<DeleteResult> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteListing(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
