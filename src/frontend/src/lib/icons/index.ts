// src/lib/icons/index.ts
import {
  HomeIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  StarIcon,
  Cog6ToothIcon as CogIcon,
  HeartIcon,
  ArrowPathRoundedSquareIcon,
  ShareIcon,
  CameraIcon,
  ChartBarIcon,
  FaceSmileIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export const icons = {
  // Navigation
  home: HomeIcon,
  feed: NewspaperIcon,
  discover: MagnifyingGlassIcon,
  notifications: BellIcon,
  messages: ChatBubbleLeftIcon,
  profile: UserIcon,
  creator: StarIcon,
  settings: CogIcon,
  
  // Social
  like: HeartIcon,
  repost: ArrowPathRoundedSquareIcon,
  share: ShareIcon,
  camera: CameraIcon,
  chart: ChartBarIcon,
  emoji: FaceSmileIcon,
  location: MapPinIcon,
} as const;

export type IconName = keyof typeof icons;