import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";

import Types "types";
import Profile "profile";
import Post "post";
import Comment "comment";
import Like "like";
import Stats "stats";

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

  // Storage variables (moved from storage.mo)
  var nextPostId : Nat = 0;
  let profiles = HashMap.HashMap<Types.UserId, Types.Profile>(0, Principal.equal, Principal.hash);
  let posts = HashMap.HashMap<Types.PostId, Types.Post>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
  let userPosts = HashMap.HashMap<Types.UserId, [Types.PostId]>(0, Principal.equal, Principal.hash);
  let postLikes = HashMap.HashMap<Types.PostId, [Types.UserId]>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });

  var nextCommentId : Nat = 0;
  let comments = HashMap.HashMap<Types.CommentId, Types.Comment>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });
  let postComments = HashMap.HashMap<Types.PostId, [Types.CommentId]>(0, Nat.equal, func(n : Nat) : Nat32 { Nat32.fromNat(n) });

  // Profile Management
  public shared({caller}) func createProfile(username : Text, bio : Text, avatar : Text) : async { #ok : Types.Profile; #err : Text } {
    await Profile.createProfile(profiles, userPosts, caller, username, bio, avatar)
  };

  public query func getProfile(userId : Types.UserId) : async ?Types.Profile {
    Profile.getProfile(profiles, userId)
  };

  public shared({caller}) func updateProfile(username : Text, bio : Text, avatar : Text) : async { #ok : Types.Profile; #err : Text } {
    await Profile.updateProfile(profiles, caller, username, bio, avatar)
  };

  // Post Management
  public shared({caller}) func createPost(content : Text) : async { #ok : Types.Post; #err : Text } {
    await Post.createPost(
      { var value = nextPostId },
      profiles,
      posts,
      userPosts,
      postLikes,
      caller,
      content
    )
  };

  public query func getPost(postId : Types.PostId) : async ?Types.Post {
    Post.getPost(posts, postId)
  };

  public query func getUserPosts(userId : Types.UserId) : async [Types.Post] {
    Post.getUserPosts(posts, userPosts, userId)
  };

  public query func getFeed(limit : Nat, offset : Nat) : async [Types.FeedPost] {
    Post.getFeed(posts, profiles)
  };

  // Like Management
  public shared({caller}) func likePost(postId : Types.PostId) : async { #ok : (); #err : Text } {
    await Like.likePost(posts, postLikes, caller, postId)
  };

  public shared({caller}) func unlikePost(postId : Types.PostId) : async { #ok : (); #err : Text } {
    await Like.unlikePost(posts, postLikes, caller, postId)
  };

  // Comment Management
  public shared({caller}) func addComment(postId: Types.PostId, content: Text) : async { #ok : Types.Comment; #err : Text } {
    await Comment.addComment(
      { var value = nextCommentId },
      posts,
      comments,
      postComments,
      postId,
      caller,
      content
    )
  };

  public query func getComments(postId: Types.PostId) : async [Types.Comment] {
    Comment.getComments(comments, postComments, postId)
  };

  // Statistics
  public query func getStats() : async { totalUsers : Nat; totalPosts : Nat; totalLikes : Nat } {
    Stats.getStats(profiles, posts)
  };

  // System functions for upgrades
  system func preupgrade() {
    // Save state for upgrades
  };

  system func postupgrade() {
    // Restore state after upgrades
  };
};
