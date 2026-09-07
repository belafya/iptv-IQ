export type QualityMode = 'auto' | 'low_data' | 'hd';

export type ViewLayout = 'grid' | 'list';

export interface IPTVChannel {
  id: string;
  name: string;
  logo?: string;
  group: string;
  url: string;
  lowResUrl?: string;
  country?: string;
  isVerified?: boolean;
  status?: 'working' | 'testing' | 'offline';
  lastChecked?: number;
}

export interface PlaylistSource {
  id: string;
  name: string;
  url: string;
  channelCount: number;
  addedAt: number;
}

export interface NetworkState {
  isOnline: boolean;
  effectiveType?: string;
  saveData?: boolean;
}
