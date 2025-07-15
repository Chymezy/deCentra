import Types "types";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

module {
  public func addComment(
    nextCommentId: { var value: Nat },
    posts: HashMap.HashMap<Types.PostId, Types.Post>,
    comments: HashMap.HashMap<Types.CommentId, Types.Comment>,
    postComments: HashMap.HashMap<Types.PostId, [Types.CommentId]>,
    postId: Types.PostId, caller: Types.UserId, content: Text
  ) : async { #ok : Types.Comment; #err : Text } {
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
    let commentId = nextCommentId.value;
    nextCommentId.value += 1;
    let now = Time.now();
    let comment : Types.Comment = {
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
      case (?ids) { postComments.put(postId, Array.append<Types.CommentId>(ids, [commentId])); };
    };
    // Increment post.comments count
    posts.put(postId, switch (posts.get(postId)) {
      case null { return #err("Post not found"); };
      case (?p) { { p with comments = p.comments + 1 } };
    });
    #ok(comment)
  };

  public func getComments(
    comments: HashMap.HashMap<Types.CommentId, Types.Comment>,
    postComments: HashMap.HashMap<Types.PostId, [Types.CommentId]>,
    postId: Types.PostId
  ) : [Types.Comment] {
    switch (postComments.get(postId)) {
      case null { [] };
      case (?ids) {
        let buf = Buffer.Buffer<Types.Comment>(ids.size());
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
} 