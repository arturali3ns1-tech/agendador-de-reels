export interface Reel {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  status: 'scheduled' | 'published' | 'failed';
  scheduledTime: string; // ISO String
  publishedAt?: string; // ISO String
  error?: string;
  permalink?: string;
  instagramMediaId?: string;
  createdAt: string; // ISO String
  accountId?: string;
  accountName?: string;
  accountUsername?: string;
  accountAvatar?: string;
}

export interface SavedAccount {
  id: string; // instagramAccountId
  username: string;
  name: string;
  profilePictureUrl?: string;
  facebookAccessToken?: string;
  sandboxMode?: boolean;
  addedAt?: string;
}

export interface Settings {
  instagramAccountId: string;
  facebookAccessToken: string;
  sandboxMode: boolean;
  intervalHours: number;
  autoScheduleEnabled: boolean;
  savedAccounts?: SavedAccount[];
  appPassword?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string; // ISO String
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  reelId?: string;
}

export interface AccountMetrics {
  accountId: string;
  accountUsername: string;
  accountName: string;
  followersCount: number;
  followersGainedToday: number;
  viewsThisWeek: number;
  mediaCount?: number;
  followsCount?: number;
  startOfTodayFollowers?: number;
  source: 'live_api' | 'simulated_sandbox';
  updatedAt: string;
}

export interface FollowerSnapshot {
  date: string;
  startFollowers: number;
  currentFollowers: number;
  lastUpdated: string;
}

export interface QueueState {
  reels: Reel[];
  settings: Settings;
  logs: LogEntry[];
  savedAccounts?: SavedAccount[];
  followerSnapshots?: Record<string, FollowerSnapshot>;
}
