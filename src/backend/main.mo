import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "types/listings";
import ListingsMixin "mixins/listings-api";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import IntValue "mo:caffeineai-oql/IntValue";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let listings : Map.Map<Nat, Types.Listing>;
  let state : { var nextId : Nat };

  include MixinAuthorization(accessControlState, null);
  include ListingsMixin(accessControlState, listings, state);
  include ApiDocMixin();

  include Expose({
    entities = [
      listings.toEntityManual("listing", "Listing", "id")
        .sample({
          id = 0;
          title = "";
          category = #bbGun;
          price = 0;
          description = "";
          images = [];
          seller = Principal.fromText("aaaaa-aa");
          sellerName = "";
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func l = l.id)
        .payload("title", func l = l.title)
        .payload("category", func l = switch (l.category) { case (#bbGun) "bbGun"; case (#equipment) "equipment" })
        .payload("price", func l = l.price)
        .payload("description", func l = l.description)
        .payload("seller", func l = l.seller)
        .payload("sellerName", func l = l.sellerName)
        .payload("createdAt", func l = l.createdAt)
        .payload("updatedAt", func l = l.updatedAt)
        .public_()
        .build(),
    ];
  });
};
