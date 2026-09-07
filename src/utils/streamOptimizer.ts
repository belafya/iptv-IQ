import Hls from 'hls.js';
import { IPTVChannel, QualityMode } from '../types';

export const STORAGE_KEYS = {
  CHANNELS: 'iptv_iq_channels_v2',
  FAVORITES: 'iptv_iq_favorites_v2',
  LAST_CHANNEL: 'iptv_iq_last_channel_v2',
  QUALITY: 'iptv_iq_quality_v2',
  ONLY_WORKING: 'iptv_iq_only_working_v2',
  SOURCES: 'iptv_iq_sources_v2',
};

// Create optimized Hls.js configuration for instant playback (<250ms)
export function getOptimizedHlsConfig(quality: QualityMode = 'auto'): Partial<Hls['config']> {
  const isLowData = quality === 'low_data';

  return {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: isLowData ? 15 : 30,
    maxBufferLength: isLowData ? 6 : 12,
    maxMaxBufferLength: isLowData ? 15 : 25,
    maxBufferSize: isLowData ? 10 * 1000 * 1000 : 30 * 1000 * 1000,
    liveSyncDurationCount: 2,
    liveMaxLatencyDurationCount: 4,
    liveDurationInfinity: true,
    fragLoadingTimeOut: 10000,
    manifestLoadingTimeOut: 8000,
    startLevel: isLowData ? 0 : -1, // start at lowest level if low data mode
    capLevelToPlayerSize: true,
    autoStartLoad: true,
  };
}

// Update CarPlay / Bluetooth metadata & Steering wheel handlers
export function syncCarPlayMediaSession(
  channel: IPTVChannel,
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
  }
) {
  if (!('mediaSession' in navigator)) return;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: channel.name,
      artist: `بث مباشر • ${channel.group || 'قنوات عربية'}`,
      album: 'IPTV IQ - البث فائق السرعة',
      artwork: [
        {
          src: channel.logo || '/icon.svg',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrev);
  } catch (err) {
    console.warn('CarPlay MediaSession error:', err);
  }
}

// Local Storage helpers
export function loadSavedFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : ['al-iraqiya-news', 'al-jazeera', 'saudi-quran'];
  } catch {
    return ['al-iraqiya-news', 'al-jazeera', 'saudi-quran'];
  }
}

export function saveFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (err) {
    console.warn('Failed saving favorites', err);
  }
}

export function loadSavedChannels(defaultChannels: IPTVChannel[]): IPTVChannel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed loading channels from cache', err);
  }
  return defaultChannels;
}

export function saveChannelsLocally(channels: IPTVChannel[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  } catch (err) {
    console.warn('Failed saving channels to cache', err);
  }
}
