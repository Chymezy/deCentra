import Types "types";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";

module {
  public func likePost(
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    postLikes: HashMap.HashMap<Types.PostId, [Types.UserId]>,
    caller : Types.UserId, postId : Types.PostId
  ) : async { #ok : (); #err : Text } {
    switch (posts.get(postId)) {
      case null { #err("Post not found") };
      case (?post) {
        switch (postLikes.get(postId)) {
          case null { #err("Post likes not found") };
          case (?likes) {
            let hasLiked = Array.find(likes, func (userId : Types.UserId) : Bool {
              Principal.equal(userId, caller)
            });
            switch (hasLiked) {
              case null {
                let newLikes = Array.append(likes, [caller]);
                postLikes.put(postId, newLikes);
                let updatedPost : Types.Post = {
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

  public func unlikePost(
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    postLikes: HashMap.HashMap<Types.PostId, [Types.UserId]>,
    caller : Types.UserId, postId : Types.PostId
  ) : async { #ok : (); #err : Text } {
    switch (posts.get(postId)) {
      case null { #err("Post not found") };
      case (?post) {
        switch (postLikes.get(postId)) {
          case null { #err("Post likes not found") };
          case (?likes) {
            let newLikes = Array.filter(likes, func (userId : Types.UserId) : Bool {
              not Principal.equal(userId, caller)
            });
            postLikes.put(postId, newLikes);
            let updatedPost : Types.Post = {
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
} 