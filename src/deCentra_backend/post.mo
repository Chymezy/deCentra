import Types "types";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

module {
  public func createPost(
    nextPostId: { var value: Nat },
    profiles: HashMap.HashMap<Types.UserId, Types.Profile>,
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    userPosts: HashMap.HashMap<Types.UserId, [Types.PostId]>,
    postLikes: HashMap.HashMap<Types.PostId, [Types.UserId]>,
    caller : Types.UserId, content : Text
  ) : async { #ok : Types.Post; #err : Text } {
    if (Text.size(content) < 1) {
      return #err("Post content cannot be empty");
    };
    if (Text.size(content) > 1000) {
      return #err("Post content must be less than 1000 characters");
    };

    switch (profiles.get(caller)) {
      case null {
        let defaultProfile : Types.Profile = {
          id = caller;
          username = "User_" # Nat.toText(nextPostId.value);
          bio = "New user on deCentra";
          avatar = "👤";
          createdAt = Time.now();
          updatedAt = Time.now();
        };
        profiles.put(caller, defaultProfile);
        userPosts.put(caller, []);
      };
      case (?_) {};
    };

    let postId = nextPostId.value;
    nextPostId.value += 1;

    let post : Types.Post = {
      id = postId;
      authorId = caller;
      content = content;
      createdAt = Time.now();
      updatedAt = Time.now();
      likes = 0;
      comments = 0;
    };

    posts.put(postId, post);
    postLikes.put(postId, []);

    switch (userPosts.get(caller)) {
      case null { userPosts.put(caller, [postId]) };
      case (?existingPosts) {
        let newPosts = Array.append(existingPosts, [postId]);
        userPosts.put(caller, newPosts);
      };
    };

    #ok(post)
  };

  public func getPost(
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    postId : Types.PostId
  ) : ?Types.Post {
    posts.get(postId)
  };

  public func getUserPosts(
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    userPosts: HashMap.HashMap<Types.UserId, [Types.PostId]>,
    userId : Types.UserId
  ) : [Types.Post] {
    switch (userPosts.get(userId)) {
      case null { [] };
      case (?postIds) {
        let userPostsBuffer = Buffer.Buffer<Types.Post>(0);
        for (postId in postIds.vals()) {
          switch (posts.get(postId)) {
            case null { };
            case (?post) { userPostsBuffer.add(post) };
          };
        };
        Buffer.toArray(userPostsBuffer)
      };
    };
  };

  public func getFeed(
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    profiles: HashMap.HashMap<Types.UserId, Types.Profile>
  ) : [Types.FeedPost] {
    let allPosts = Buffer.Buffer<Types.Post>(0);
    for ((postId, post) in posts.entries()) {
      allPosts.add(post);
    };

    let feedPosts = Buffer.Buffer<Types.FeedPost>(0);
    for (post in allPosts.vals()) {
      switch (profiles.get(post.authorId)) {
        case null {
          let defaultProfile : Types.Profile = {
            id = post.authorId;
            username = "Anonymous";
            bio = "";
            avatar = "?";
            createdAt = post.createdAt;
            updatedAt = post.updatedAt;
          };
          feedPosts.add({ post = post; author = defaultProfile });
        };
        case (?profile) {
          feedPosts.add({ post = post; author = profile });
        };
      };
    };
    Buffer.toArray(feedPosts)
  };
} 