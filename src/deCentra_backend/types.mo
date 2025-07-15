module {
  public type UserId = Principal;
  public type PostId = Nat;
  public type Timestamp = Int;

  public type Profile = {
    id : UserId;
    username : Text;
    bio : Text;
    avatar : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type Post = {
    id : PostId;
    authorId : UserId;
    content : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    likes : Nat;
    comments : Nat;
  };

  public type FeedPost = {
    post : Post;
    author : Profile;
  };

  public type CommentId = Nat;
  public type Comment = {
    id : CommentId;
    postId : PostId;
    authorId : UserId;
    content : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
} 