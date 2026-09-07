/**
 * iOS & Mobile Background Playback & AirPlay Keep-Alive Service
 * Manages WakeLock, MediaSession for Lock Screen & CarPlay,
 * and maintains seamless video + audio streaming to AirPlay TV.
 */

import { IPTVChannel } from '../types';

class BackgroundPlaybackManager {
  private wakeLock: any = null;

  constructor() {
    this.setupVisibilityListeners();
  }

  // Request Screen WakeLock so device screen doesn't unexpectedly shut down
  public async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        if (!this.wakeLock) {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
          this.wakeLock.addEventListener('release', () => {
            this.wakeLock = null;
          });
        }
        return true;
      } catch (err) {
        console.warn('WakeLock not granted or supported:', err);
      }
    }
    return false;
  }

  public releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
        this.wakeLock = null;
      } catch {}
    }
  }

  // Synchronize iOS Lock Screen, CarPlay & Control Center metadata
  public updateMediaSession(
    channel: IPTVChannel,
    callbacks: {
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
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.playbackState = 'playing';

      navigator.mediaSession.setActionHandler('play', () => {
        navigator.mediaSession.playbackState = 'playing';
        callbacks.onPlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        navigator.mediaSession.playbackState = 'paused';
        callbacks.onPause();
      });

      navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNext);
      navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPrev);

      // Support generic controls for CarPlay steering wheel & Apple Watch
      try {
        navigator.mediaSession.setActionHandler('stop', () => {
          navigator.mediaSession.playbackState = 'none';
          callbacks.onPause();
        });
      } catch {}
    } catch (err) {
      console.warn('MediaSession update warning:', err);
    }
  }

  private setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Re-acquire wake lock when user returns to app
        this.requestWakeLock();
      }
    });
  }
}

export const backgroundPlaybackService = new BackgroundPlaybackManager();

