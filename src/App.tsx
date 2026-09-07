import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LivePlayer } from './components/LivePlayer';
import { ChannelList } from './components/ChannelList';
import { AddSourceModal } from './components/AddSourceModal';
import { CarPlayGuideModal } from './components/CarPlayGuideModal';
import { IOSInstallGuideModal } from './components/IOSInstallGuideModal';
import { OfflineBanner } from './components/OfflineBanner';
import { CURATED_IPTV_CHANNELS } from './data/curatedChannels';
import { IPTVChannel, QualityMode } from './types';
import {
  loadSavedChannels,
  loadSavedFavorites,
  saveFavorites,
  saveChannelsLocally,
  STORAGE_KEYS,
} from './utils/streamOptimizer';
import { Tv, Sparkles, ShieldCheck, Zap, Car, Cast, Wifi, Radio } from 'lucide-react';

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

  // Next / Prev Channel navigation
  const activeWorkingChannels = channels.filter(
    (c) => !onlyWorking || c.status !== 'offline'
  );

  const handleNextChannel = () => {
    const idx = activeWorkingChannels.findIndex((c) => c.id === currentChannel.id);
    if (idx !== -1 && idx < activeWorkingChannels.length - 1) {
      handleSelectChannel(activeWorkingChannels[idx + 1]);
    } else if (activeWorkingChannels.length > 0) {
      handleSelectChannel(activeWorkingChannels[0]);
    }
  };

  const handlePrevChannel = () => {
    const idx = activeWorkingChannels.findIndex((c) => c.id === currentChannel.id);
    if (idx > 0) {
      handleSelectChannel(activeWorkingChannels[idx - 1]);
    } else if (activeWorkingChannels.length > 0) {
      handleSelectChannel(activeWorkingChannels[activeWorkingChannels.length - 1]);
    }
  };

  const workingCount = channels.filter((c) => c.status !== 'offline').length;

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
            channel={currentChannel}
            isFavorite={favoriteIds.includes(currentChannel.id)}
            onToggleFavorite={handleToggleFavorite}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
            onChannelError={handleChannelError}
            qualityMode={qualityMode}
            onChangeQualityMode={handleChangeQualityMode}
            isOnline={isOnline}
          />
        </section>

        {/* Channels Catalog & Filters */}
        <section className="w-full">
          <ChannelList
            channels={channels}
            currentChannelId={currentChannel.id}
            onSelectChannel={handleSelectChannel}
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

    </div>
  );
}
