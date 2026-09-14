import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  type Category = {
    #bbGun;
    #equipment;
  };

  type Listing = {
    id : Nat;
    title : Text;
    category : Category;
    price : Nat;
    description : Text;
    images : [Text];
    seller : Principal;
    sellerName : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    listings : Map.Map<Nat, Listing>;
    state : { var nextId : Nat };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      listings = Map.empty();
      state = { var nextId = 0 };
    };
  };
};
