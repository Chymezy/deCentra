import Types "types";
import HashMap "mo:base/HashMap";

module {
  public func getStats(
    profiles: HashMap.HashMap<Types.UserId, Types.Profile>,
    posts: HashMap.HashMap<Types.PostId, Types.Post>
  ) : { totalUsers : Nat; totalPosts : Nat; totalLikes : Nat } {
    let totalUsers = profiles.size();
    let totalPosts = posts.size();
    var totalLikes = 0;
    for ((postId, post) in posts.entries()) {
      totalLikes += post.likes;
    };
    { totalUsers; totalPosts; totalLikes }
  }
} 