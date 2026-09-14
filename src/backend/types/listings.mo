module {
  public type Category = {
    #bbGun; // จำหน่าย บีบีกัน
    #equipment; // อุปกรณ์ (มือ2)
  };

  public type Listing = {
    id : Nat;
    title : Text;
    category : Category;
    price : Nat;
    description : Text;
    images : [Text]; // object-storage references
    seller : Principal; // seller identity
    sellerName : Text; // seller display name
    createdAt : Int; // timestamp (nanoseconds)
    updatedAt : Int; // timestamp (nanoseconds)
  };

  public type SellerContact = {
    seller : Principal;
    sellerName : Text;
  };

  public type ListingError = {
    #notFound : Nat;
    #notAuthorized;
  };
};
