import Types "types";
import Time "mo:base/Time";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";

module {
  public func createProfile(
    profiles: HashMap.HashMap<Types.UserId, Types.Profile>,
    userPosts: HashMap.HashMap<Types.UserId, [Types.PostId]>,
    caller : Types.UserId, username : Text, bio : Text, avatar : Text
  ) : async { #ok : Types.Profile; #err : Text } {
    if (Text.size(username) < 3) {
      return #err("Username must be at least 3 characters");
    };
    if (Text.size(username) > 20) {
      return #err("Username must be less than 20 characters");
    };
    if (Text.size(bio) > 500) {
      return #err("Bio must be less than 500 characters");
    };

    let profile : Types.Profile = {
      id = caller;
      username = username;
      bio = bio;
      avatar = avatar;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    profiles.put(caller, profile);
    userPosts.put(caller, []);
    #ok(profile)
  };

  public func getProfile(
    profiles: HashMap.HashMap<Types.UserId, Types.Profile>,
    userId : Types.UserId
  ) : ?Types.Profile {
    profiles.get(userId)
  };

  public func updateProfile(
    profiles: HashMap.HashMap<Types.UserId, Types.Profile>,
    caller : Types.UserId, username : Text, bio : Text, avatar : Text
  ) : async { #ok : Types.Profile; #err : Text } {
    switch (profiles.get(caller)) {
      case null { #err("Profile not found") };
      case (?existingProfile) {
        if (Text.size(username) < 3) {
          return #err("Username must be at least 3 characters");
        };
        if (Text.size(username) > 20) {
          return #err("Username must be less than 20 characters");
        };
        if (Text.size(bio) > 500) {
          return #err("Bio must be less than 500 characters");
        };

        let updatedProfile : Types.Profile = {
          id = caller;
          username = username;
          bio = bio;
          avatar = avatar;
          createdAt = existingProfile.createdAt;
          updatedAt = Time.now();
        };

        profiles.put(caller, updatedProfile);
        #ok(updatedProfile)
      };
    };
  };
} 