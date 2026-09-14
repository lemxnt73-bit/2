import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Result "mo:core/Result";
import Types "../types/listings";

module {
  public func createListing(
    listings : Map.Map<Nat, Types.Listing>,
    state : { var nextId : Nat },
    caller : Principal,
    title : Text,
    category : Types.Category,
    price : Nat,
    description : Text,
    images : [Text],
    sellerName : Text,
    now : Int,
  ) : Types.Listing {
    let id = state.nextId;
    state.nextId += 1;
    let listing : Types.Listing = {
      id;
      title;
      category;
      price;
      description;
      images;
      seller = caller;
      sellerName;
      createdAt = now;
      updatedAt = now;
    };
    listings.add(id, listing);
    listing
  };

  public func updateListing(
    listings : Map.Map<Nat, Types.Listing>,
    id : Nat,
    caller : Principal,
    title : Text,
    category : Types.Category,
    price : Nat,
    description : Text,
    images : [Text],
    now : Int,
  ) : Result.Result<Types.Listing, Types.ListingError> {
    switch (listings.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        if (existing.seller != caller) {
          #err(#notAuthorized)
        } else {
          let updated : Types.Listing = {
            existing with
            title;
            category;
            price;
            description;
            images;
            updatedAt = now;
          };
          listings.add(id, updated);
          #ok(updated)
        };
      };
    };
  };

  public func deleteListing(
    listings : Map.Map<Nat, Types.Listing>,
    id : Nat,
    caller : Principal,
  ) : Result.Result<(), Types.ListingError> {
    switch (listings.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        if (existing.seller != caller) {
          #err(#notAuthorized)
        } else {
          listings.remove(id);
          #ok(())
        };
      };
    };
  };

  public func getListing(
    listings : Map.Map<Nat, Types.Listing>,
    id : Nat,
  ) : ?Types.Listing {
    listings.get(id)
  };

  public func listListings(
    listings : Map.Map<Nat, Types.Listing>,
    category : ?Types.Category,
    keyword : ?Text,
  ) : [Types.Listing] {
    let all = listings.values().toArray();
    let byCategory = switch (category) {
      case (?c) { all.filter(func l = l.category == c) };
      case null { all };
    };
    switch (keyword) {
      case (?k) {
        let term = k.toLower();
        byCategory.filter(
          func l = l.title.toLower().contains(#text term) or l.description.toLower().contains(#text term)
        )
      };
      case null { byCategory };
    };
  };

  public func getSellerContact(
    listings : Map.Map<Nat, Types.Listing>,
    id : Nat,
  ) : ?Types.SellerContact {
    switch (listings.get(id)) {
      case null { null };
      case (?l) { ?{ seller = l.seller; sellerName = l.sellerName } };
    };
  };
};
