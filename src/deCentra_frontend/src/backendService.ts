import { deCentra_backend } from '../../declarations/deCentra_backend';
import { Principal } from '@dfinity/principal';

export const BackendService = {
  getFeed: (offset = 0n, limit = 20n) => deCentra_backend.getFeed(offset, limit),
  createPost: (content: string) => deCentra_backend.createPost(content),
  likePost: (postId: bigint) => deCentra_backend.likePost(postId),
  addComment: (postId: bigint, content: string) => deCentra_backend.addComment(postId, content),
  getComments: (postId: bigint) => deCentra_backend.getComments(postId),
  getProfile: (principal: string) => deCentra_backend.getProfile(Principal.fromText(principal)),
  updateProfile: (username: string, bio: string, avatar: string) => deCentra_backend.updateProfile(username, bio, avatar),
  createProfile: (username: string, bio: string, avatar: string) => deCentra_backend.createProfile(username, bio, avatar),
}; 