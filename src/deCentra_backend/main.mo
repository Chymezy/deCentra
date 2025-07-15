import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";

actor {
  // Types
  type UserId = Principal;
  type PostId = Nat;
  type Timestamp = Int;

  type Profile = {
    id : UserId;
    username : Text;
    bio : Text;
    avatar : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  type Post = {
    id : PostId;
    authorId : UserId;
    content : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    likes : Nat;
    comments : Nat;
  };

  type FeedPost = {
    post : Post;
    author : Profile;
  };

  // Comment Types
  type CommentId = Nat;
  type Comment = {
    id : CommentId;
    postId : PostId;
    authorId : UserId;
    content : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Storage
  private stable var nextPostId : Nat = 0;
  private var profiles = HashMap.HashMap<UserId, Profile>(0, Principal.equal, Principal.hash);
  private var posts = HashMap.HashMap<PostId, Post>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
  private var userPosts = HashMap.HashMap<UserId, [PostId]>(0, Principal.equal, Principal.hash);
  private var postLikes = HashMap.HashMap<PostId, [UserId]>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });

  // Comment State
  private stable var nextCommentId : Nat = 0;
  private var comments = HashMap.HashMap<CommentId, Comment>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
  private var postComments = HashMap.HashMap<PostId, [CommentId]>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });

  // Profile Management
  public shared({caller}) func createProfile(username : Text, bio : Text, avatar : Text) : async { #ok : Profile; #err : Text } {
    if (Text.size(username) < 3) {
      return #err("Username must be at least 3 characters");
    };
    if (Text.size(username) > 20) {
      return #err("Username must be less than 20 characters");
    };
    if (Text.size(bio) > 500) {
      return #err("Bio must be less than 500 characters");
    };

    let profile : Profile = {
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

  public query func getProfile(userId : UserId) : async ?Profile {
    profiles.get(userId)
  };

  public shared({caller}) func updateProfile(username : Text, bio : Text, avatar : Text) : async { #ok : Profile; #err : Text } {
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

        let updatedProfile : Profile = {
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

  // Post Management
  public shared({caller}) func createPost(content : Text) : async { #ok : Post; #err : Text } {
    if (Text.size(content) < 1) {
      return #err("Post content cannot be empty");
    };
    if (Text.size(content) > 1000) {
      return #err("Post content must be less than 1000 characters");
    };

    // Create a default profile if one doesn't exist
    switch (profiles.get(caller)) {
      case null {
        let defaultProfile : Profile = {
          id = caller;
          username = "User_" # Nat.toText(nextPostId);
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

    let postId = nextPostId;
    nextPostId += 1;

    let post : Post = {
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

    // Add to user's posts
    switch (userPosts.get(caller)) {
      case null { userPosts.put(caller, [postId]) };
      case (?existingPosts) {
        let newPosts = Array.append(existingPosts, [postId]);
        userPosts.put(caller, newPosts);
      };
    };

    #ok(post)
  };

  public query func getPost(postId : PostId) : async ?Post {
    posts.get(postId)
  };

  public query func getUserPosts(userId : UserId) : async [Post] {
    switch (userPosts.get(userId)) {
      case null { [] };
      case (?postIds) {
        let userPostsBuffer = Buffer.Buffer<Post>(0);
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

  public query func getFeed(limit : Nat, offset : Nat) : async [FeedPost] {
    let allPosts = Buffer.Buffer<Post>(0);
    for ((postId, post) in posts.entries()) {
      allPosts.add(post);
    };

    // Convert to FeedPost with author info
    let feedPosts = Buffer.Buffer<FeedPost>(0);
    for (post in allPosts.vals()) {
      switch (profiles.get(post.authorId)) {
        case null { 
          // If no profile exists, create a default one
          let defaultProfile : Profile = {
            id = post.authorId;
            username = "Anonymous";
            bio = "";
            avatar = "?";
            createdAt = post.createdAt;
            updatedAt = post.updatedAt;
          };
          feedPosts.add({
            post = post;
            author = defaultProfile;
          });
        };
        case (?profile) {
          feedPosts.add({
            post = post;
            author = profile;
          });
        };
      };
    };

    Buffer.toArray(feedPosts)
  };

  // Like Management
  public shared({caller}) func likePost(postId : PostId) : async { #ok : (); #err : Text } {
    switch (posts.get(postId)) {
      case null { #err("Post not found") };
      case (?post) {
        switch (postLikes.get(postId)) {
          case null { #err("Post likes not found") };
          case (?likes) {
            // Check if user already liked
            let hasLiked = Array.find(likes, func (userId : UserId) : Bool {
              Principal.equal(userId, caller)
            });

            switch (hasLiked) {
              case null {
                // Add like
                let newLikes = Array.append(likes, [caller]);
                postLikes.put(postId, newLikes);
                
                let updatedPost : Post = {
                  id = post.id;
                  authorId = post.authorId;
                  content = post.content;
                  createdAt = post.createdAt;
                  updatedAt = Time.now();
                  likes = post.likes + 1;
                  comments = post.comments;
                };
                posts.put(postId, updatedPost);
                #ok(())
              };
              case (?_) { #err("Already liked this post") };
            };
          };
        };
      };
    };
  };

  public shared({caller}) func unlikePost(postId : PostId) : async { #ok : (); #err : Text } {
    switch (posts.get(postId)) {
      case null { #err("Post not found") };
      case (?post) {
        switch (postLikes.get(postId)) {
          case null { #err("Post likes not found") };
          case (?likes) {
            // Remove like
            let newLikes = Array.filter(likes, func (userId : UserId) : Bool {
              not Principal.equal(userId, caller)
            });

            postLikes.put(postId, newLikes);
            
            let updatedPost : Post = {
              id = post.id;
              authorId = post.authorId;
              content = post.content;
              createdAt = post.createdAt;
              updatedAt = Time.now();
              likes = post.likes - 1;
              comments = post.comments;
            };
            posts.put(postId, updatedPost);
            #ok(())
          };
        };
      };
    };
  };

  // Add Comment
  public shared({caller}) func addComment(postId: PostId, content: Text) : async { #ok : Comment; #err : Text } {
    if (Text.size(content) < 1) {
      return #err("Comment cannot be empty");
    };
    if (Text.size(content) > 500) {
      return #err("Comment must be less than 500 characters");
    };
    switch (posts.get(postId)) {
      case null { return #err("Post not found"); };
      case (?_) {};
    };
    let commentId = nextCommentId;
    nextCommentId += 1;
    let now = Time.now();
    let comment : Comment = {
      id = commentId;
      postId = postId;
      authorId = caller;
      content = content;
      createdAt = now;
      updatedAt = now;
    };
    comments.put(commentId, comment);
    switch (postComments.get(postId)) {
      case null { postComments.put(postId, [commentId]); };
      case (?ids) { postComments.put(postId, Array.append<CommentId>(ids, [commentId])); };
    };
    // Increment post.comments count
    posts.put(postId, switch (posts.get(postId)) {
      case null { return #err("Post not found"); };
      case (?p) { { p with comments = p.comments + 1 } };
    });
    #ok(comment)
  };

  // Get Comments for a Post
  public query func getComments(postId: PostId) : async [Comment] {
    switch (postComments.get(postId)) {
      case null { [] };
      case (?ids) {
        let buf = Buffer.Buffer<Comment>(ids.size());
        for (id in ids.vals()) {
          switch (comments.get(id)) {
            case (?c) { buf.add(c) };
            case null {};
          }
        };
        Buffer.toArray(buf)
      }
    }
  };

  // Statistics
  public query func getStats() : async { totalUsers : Nat; totalPosts : Nat; totalLikes : Nat } {
    let totalUsers = profiles.size();
    let totalPosts = posts.size();
    var totalLikes = 0;
    for ((postId, post) in posts.entries()) {
      totalLikes += post.likes;
    };
    { totalUsers; totalPosts; totalLikes }
  };

  // System functions for upgrades
  system func preupgrade() {
    // Save state for upgrades
  };

  system func postupgrade() {
    // Restore state after upgrades
  };
};
