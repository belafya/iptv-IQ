/**
 * iOS & Mobile Background Playback & AirPlay Keep-Alive Service
 * Enables continuous TV AirPlay streaming, background audio, lock screen controls,
 * and prevents stream termination when switching apps or locking the screen.
 */

import { IPTVChannel } from '../types';

class BackgroundPlaybackManager {
  private wakeLock: any = null;
  private audioContext: AudioContext | null = null;
  private isBackgroundAudioActive: boolean = false;
  private silentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    this.setupVisibilityListeners();
  }

  // Request Screen WakeLock so device screen doesn't unexpectedly shut down
  public async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
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

  // Initialize background audio session to keep iOS WebKit process active
  public startBackgroundKeepAlive() {
    if (this.isBackgroundAudioActive) return;

    try {
      // 1. Web Audio Context Silent Carrier
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }

        // Create an inaudible low-frequency oscillator buffer (keeps audio daemon active)
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.001; // virtually silent
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
      }

      // 2. HTML5 Audio Element Fallback (Silent base64 MP3 loop for iOS Safari)
      if (!this.silentAudioElement) {
        this.silentAudioElement = new Audio();
        // 1-second silent MP3 base64
        this.silentAudioElement.src =
          'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/////wAAADFMQVNFAAAAWAAAAP//////////////////////////////////////////////////////////////////';
        this.silentAudioElement.loop = true;
        this.silentAudioElement.volume = 0.01;
      }

      this.silentAudioElement.play().catch(() => {});
      this.isBackgroundAudioActive = true;
    } catch (err) {
      console.warn('Background audio keep-alive init error:', err);
    }
  }

  public stopBackgroundKeepAlive() {
    this.isBackgroundAudioActive = false;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    if (this.silentAudioElement) {
      try {
        this.silentAudioElement.pause();
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
