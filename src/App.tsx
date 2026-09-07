import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LivePlayer } from './components/LivePlayer';
import { ChannelList } from './components/ChannelList';
import { AddSourceModal } from './components/AddSourceModal';
import { CarPlayGuideModal } from './components/CarPlayGuideModal';
import { IOSInstallGuideModal } from './components/IOSInstallGuideModal';
import { TVAirPlayFixModal } from './components/TVAirPlayFixModal';
import { MediaVaultModal } from './components/MediaVaultModal';
import { OfflineBanner } from './components/OfflineBanner';
import { CURATED_IPTV_CHANNELS } from './data/curatedChannels';
import { IPTVChannel, QualityMode, LocalMediaItem } from './types';
import {
  loadSavedChannels,
  loadSavedFavorites,
  saveFavorites,
  saveChannelsLocally,
  STORAGE_KEYS,
} from './utils/streamOptimizer';
import { Tv, Sparkles, ShieldCheck, Zap, Car, Cast, Wifi, Radio, Folder } from 'lucide-react';

export default function App() {
  // Load initial cached channels & favorites
  const [channels, setChannels] = useState<IPTVChannel[]>(() =>
    loadSavedChannels(CURATED_IPTV_CHANNELS)
  );

  const [currentChannel, setCurrentChannel] = useState<IPTVChannel>(() => {
    const saved = loadSavedChannels(CURATED_IPTV_CHANNELS);
    const lastId = localStorage.getItem(STORAGE_KEYS.LAST_CHANNEL);
    const found = saved.find((c) => c.id === lastId);
    return found || saved[0] || CURATED_IPTV_CHANNELS[0];
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadSavedFavorites());
  const [qualityMode, setQualityMode] = useState<QualityMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.QUALITY) as QualityMode) || 'auto';
  });
  const [onlyWorking, setOnlyWorking] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ONLY_WORKING);
    return saved !== null ? saved === 'true' : true;
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false);
  const [isCarPlayGuideOpen, setIsCarPlayGuideOpen] = useState<boolean>(false);
  const [isIOSGuideOpen, setIsIOSGuideOpen] = useState<boolean>(false);
  const [isTVAirPlayFixOpen, setIsTVAirPlayFixOpen] = useState<boolean>(false);
  const [isMediaVaultOpen, setIsMediaVaultOpen] = useState<boolean>(false);
  const [activeLocalMedia, setActiveLocalMedia] = useState<LocalMediaItem | null>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage
  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const handleSelectChannel = (channel: IPTVChannel) => {
    setCurrentChannel(channel);
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_CHANNEL, channel.id);
    } catch {}
  };

  const handleChangeQualityMode = (mode: QualityMode) => {
    setQualityMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.QUALITY, mode);
    } catch {}
  };

  const handleToggleOnlyWorking = () => {
    setOnlyWorking((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.ONLY_WORKING, String(next));
      } catch {}
      return next;
    });
  };

  // If a channel stream errors out, mark it offline
  const handleChannelError = useCallback((channelId: string) => {
    setChannels((prev) => {
      const updated = prev.map((ch) =>
        ch.id === channelId ? { ...ch, status: 'offline' as const } : ch
      );
      saveChannelsLocally(updated);
      return updated;
    });
  }, []);

  // Guarded currentChannel
  const safeCurrentChannel: IPTVChannel = currentChannel || channels[0] || CURATED_IPTV_CHANNELS[0];

  // Next / Prev Channel navigation
  const activeWorkingChannels = channels.filter(
    (c) => c && (!onlyWorking || c.status !== 'offline')
  );

  const handleNextChannel = () => {
    if (activeWorkingChannels.length === 0) return;
    const idx = activeWorkingChannels.findIndex((c) => c.id === safeCurrentChannel.id);
    if (idx !== -1 && idx < activeWorkingChannels.length - 1) {
      handleSelectChannel(activeWorkingChannels[idx + 1]);
    } else {
      handleSelectChannel(activeWorkingChannels[0]);
    }
  };

  const handlePrevChannel = () => {
    if (activeWorkingChannels.length === 0) return;
    const idx = activeWorkingChannels.findIndex((c) => c.id === safeCurrentChannel.id);
    if (idx > 0) {
      handleSelectChannel(activeWorkingChannels[idx - 1]);
    } else {
      handleSelectChannel(activeWorkingChannels[activeWorkingChannels.length - 1]);
    }
  };

  const workingCount = channels.filter((c) => c && c.status !== 'offline').length;


  return (
    <div
      id="iptv-app-root"
      className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased"
    >
      {/* Top White Navbar */}
      <Navbar
        isOnline={isOnline}
        onOpenAddSource={() => setIsAddSourceOpen(true)}
        onOpenCarPlayGuide={() => setIsCarPlayGuideOpen(true)}
        onOpenIOSGuide={() => setIsIOSGuideOpen(true)}
        onOpenMediaVault={() => setIsMediaVaultOpen(true)}
        workingCount={workingCount}
        totalCount={channels.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4 sm:space-y-6">
        
        {/* Offline Alert Banner */}
        {!isOnline && (
          <OfflineBanner
            cachedCount={channels.length}
            onRetry={() => {
              setIsOnline(navigator.onLine);
              window.location.reload();
            }}
          />
        )}

        {/* Live TV Video Player Container */}
        <section className="w-full">
          <LivePlayer
            channel={safeCurrentChannel}
            isFavorite={favoriteIds.includes(safeCurrentChannel.id)}
            onToggleFavorite={handleToggleFavorite}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
            onChannelError={handleChannelError}
            qualityMode={qualityMode}
            onChangeQualityMode={handleChangeQualityMode}
            isOnline={isOnline}
            onOpenGuide={() => setIsCarPlayGuideOpen(true)}
            onOpenTVFix={() => setIsTVAirPlayFixOpen(true)}
            onOpenMediaVault={() => setIsMediaVaultOpen(true)}
            activeLocalMedia={activeLocalMedia}
            onClearLocalMedia={() => setActiveLocalMedia(null)}
          />
        </section>


        {/* Channels Catalog & Filters */}
        <section className="w-full">
          <ChannelList
            channels={channels}
            currentChannelId={safeCurrentChannel.id}
            onSelectChannel={(ch) => {
              setActiveLocalMedia(null);
              handleSelectChannel(ch);
            }}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onlyWorking={onlyWorking}
            onToggleOnlyWorking={handleToggleOnlyWorking}
          />
        </section>


      </main>

      {/* White Clean Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 mt-6 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">IPTV IQ Pro</span>
            <span>•</span>
            <span>بث القنوات العراقية والعربية فائق السرعة</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <button
              onClick={() => setIsMediaVaultOpen(true)}
              className="text-blue-700 hover:text-blue-800 font-bold transition cursor-pointer flex items-center gap-1"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>مجلد ملفات IPTV IQ</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsTVAirPlayFixOpen(true)}
              className="text-amber-700 hover:text-amber-800 font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>حل مشكلة التلفاز</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCarPlayGuideOpen(true)}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              دليل Apple CarPlay
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAddSourceOpen(true)}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              استيراد روابط M3U
            </button>
            <span>•</span>
            <button
              onClick={() => setIsIOSGuideOpen(true)}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              تثبيت PWA
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onChannelsUpdated={(newChannels) => {
          setChannels(newChannels);
          if (newChannels.length > 0) {
            setCurrentChannel(newChannels[0]);
          }
        }}
      />

      <CarPlayGuideModal
        isOpen={isCarPlayGuideOpen}
        onClose={() => setIsCarPlayGuideOpen(false)}
      />

      <IOSInstallGuideModal
        isOpen={isIOSGuideOpen}
        onClose={() => setIsIOSGuideOpen(false)}
      />

      <TVAirPlayFixModal
        isOpen={isTVAirPlayFixOpen}
        onClose={() => setIsTVAirPlayFixOpen(false)}
        onReconnectStream={() => {
          // Force reload active stream
          const ch = safeCurrentChannel;
          handleSelectChannel({ ...ch });
        }}
      />

      <MediaVaultModal
        isOpen={isMediaVaultOpen}
        onClose={() => setIsMediaVaultOpen(false)}
        onPlayLocalVideo={(mediaItem) => {
          setActiveLocalMedia(mediaItem);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}
