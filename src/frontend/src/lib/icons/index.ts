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
  GlobeAltIcon,
  UserGroupIcon,
  LinkIcon,
  SparklesIcon,
  BoltIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  RocketLaunchIcon,
  PencilIcon,
  DocumentTextIcon,
  ChartPieIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  EyeIcon,
  TagIcon,
  ShieldCheckIcon,
  CheckIcon,
  CodeBracketIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CircleStackIcon,
  CalendarIcon,
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

  // Visibility & Privacy
  public: GlobeAltIcon,
  followers: UserGroupIcon,
  unlisted: LinkIcon,
  lock: LockClosedIcon,

  // General UI
  sparkles: SparklesIcon,
  bolt: BoltIcon,
  money: CurrencyDollarIcon,
  gift: GiftIcon,
  trophy: TrophyIcon,
  fire: FireIcon,
  rocket: RocketLaunchIcon,
  pencil: PencilIcon,
  document: DocumentTextIcon,
  pie: ChartPieIcon,
  megaphone: MegaphoneIcon,
  paintbrush: PaintBrushIcon,
  phone: DevicePhoneMobileIcon,
  lightbulb: LightBulbIcon,
  folder: FolderIcon,
  clipboard: ClipboardDocumentListIcon,
  envelope: EnvelopeIcon,
  eye: EyeIcon,
  target: TagIcon,
  shield: ShieldCheckIcon,
  check: CheckIcon,

  // New additions for CTA and other sections
  user: UserIcon, // Avatar fallback
  developer: CodeBracketIcon, // 👨‍💻
  video: VideoCameraIcon, // 🎥
  building: BuildingOfficeIcon, // 🏢
  warning: ExclamationTriangleIcon, // ⚠️
  close: XMarkIcon, // ❌
  database: CircleStackIcon, // For mode indicators
  calendar: CalendarIcon, // 📅
} as const;

export type IconName = keyof typeof icons;
