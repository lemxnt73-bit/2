import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/listings";
import ListingsLib "../lib/listings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  listings : Map.Map<Nat, Types.Listing>,
  state : { var nextId : Nat },
) {
  public shared ({ caller }) func createListing(
    title : Text,
    category : Types.Category,
    price : Nat,
    description : Text,
    images : [Text],
    sellerName : Text,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    // Only signed-in (registered) users may create listings. An anonymous or
    // unregistered caller gets a graceful error instead of a trap, so the
    // frontend can branch on it and prompt the caller to sign in.
    let isSignedIn = not caller.isAnonymous() and accessControlState.userRoles.get(caller) != null;
    if (not isSignedIn) {
      return #err(#notAuthorized);
    };
    #ok(ListingsLib.createListing(listings, state, caller, title, category, price, description, images, sellerName, Time.now()))
  };

  public shared ({ caller }) func updateListing(
    id : Nat,
    title : Text,
    category : Types.Category,
    price : Nat,
    description : Text,
    images : [Text],
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    ListingsLib.updateListing(listings, id, caller, title, category, price, description, images, Time.now())
  };

  public shared ({ caller }) func deleteListing(
    id : Nat,
  ) : async Result.Result<(), Types.ListingError> {
    ListingsLib.deleteListing(listings, id, caller)
  };

  public query func getListing(id : Nat) : async ?Types.Listing {
    ListingsLib.getListing(listings, id)
  };

  public query func listListings(
    category : ?Types.Category,
    keyword : ?Text,
  ) : async [Types.Listing] {
    ListingsLib.listListings(listings, category, keyword)
  };

  public query func getSellerContact(id : Nat) : async ?Types.SellerContact {
    ListingsLib.getSellerContact(listings, id)
  };
};
