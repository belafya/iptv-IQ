import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Cast,
  RotateCcw,
  Sparkles,
  Car,
  ChevronRight,
  ChevronLeft,
  Tv,
  Star,
  Zap,
  SlidersHorizontal,
  Wifi,
  Radio,
  PictureInPicture2,
  ShieldCheck
} from 'lucide-react';
import Hls from 'hls.js';
import { IPTVChannel, QualityMode } from '../types';
import { getOptimizedHlsConfig, syncCarPlayMediaSession } from '../utils/streamOptimizer';

interface LivePlayerProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onChannelError?: (channelId: string) => void;
  qualityMode: QualityMode;
  onChangeQualityMode: (mode: QualityMode) => void;
  isOnline: boolean;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({
  channel,
  isFavorite,
  onToggleFavorite,
  onNextChannel,
  onPrevChannel,
  onChannelError,
  qualityMode,
  onChangeQualityMode,
  isOnline,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAirPlayActive, setIsAirPlayActive] = useState<boolean>(false);
  const [aspectFit, setAspectFit] = useState<'contain' | 'cover'>('contain');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Setup CarPlay MediaSession
  const setupMediaSession = useCallback(() => {
    syncCarPlayMediaSession(channel, {
      onPlay: () => {
        if (videoRef.current) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      },
      onPause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      onNext: onNextChannel,
      onPrev: onPrevChannel,
    });
  }, [channel, onNextChannel, onPrevChannel]);

  // Load Stream via Native Safari HLS or Hls.js
  const loadStream = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setErrorMessage(null);
    setIsBuffering(true);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = (qualityMode === 'low_data' && channel.lowResUrl) ? channel.lowResUrl : channel.url;
    setupMediaSession();

    // Check Safari / iOS Native HLS support
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      video.play().then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      }).catch((err) => {
        console.warn('Native HLS autoplay catch:', err);
        setIsBuffering(false);
      });
    } else if (Hls.isSupported()) {
      // Hls.js for Chrome / Firefox / Android / Desktop
      const config = getOptimizedHlsConfig(qualityMode);
      const hls = new Hls(config);
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        setErrorMessage(null);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('جارِ استعادة البث التلفزيوني...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage('تعذر تشغيل هذا الرابط المباشر حالياً.');
              if (onChannelError) onChannelError(channel.id);
              hls.destroy();
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      video.load();
    }
  }, [channel, qualityMode, setupMediaSession, onChannelError]);

  // Reload when channel or quality changes
  useEffect(() => {
    loadStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, qualityMode, loadStream]);

  // AirPlay detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleAirPlayChanged = () => {
      const isWireless = (video as any).webkitCurrentPlaybackTargetIsWireless;
      setIsAirPlayActive(!!isWireless);
    };

    video.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', handleAirPlayChanged);
    return () => {
      if (video) {
        video.removeEventListener('webkitcurrentplaybacktargetiswirelesschanged', handleAirPlayChanged);
      }
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if ((video as any).webkitEnterFullscreen) {
      (video as any).webkitEnterFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      } else if ((video as any).webkitSetPresentationMode) {
        (video as any).webkitSetPresentationMode('picture-in-picture');
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const triggerAirPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    if (typeof (video as any).webkitShowPlaybackTargetPicker === 'function') {
      (video as any).webkitShowPlaybackTargetPicker();
    } else if ('remote' in video && (video as any).remote && typeof (video as any).remote.prompt === 'function') {
      (video as any).remote.prompt().catch(() => {});
    } else {
      toggleFullscreen();
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden flex flex-col transition-all">
      
      {/* VIDEO STAGE */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group select-none">
        
        {/* Core Video Element */}
        <video
          ref={videoRef}
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          preload="auto"
          autoPlay
          muted={isMuted}
          className={`w-full h-full ${aspectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
            setErrorMessage(null);
          }}
          onClick={togglePlay}
        />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2.5 bg-white/95 text-slate-900 border border-white/20 px-4 py-2 rounded-2xl shadow-xl text-xs font-semibold">
              <RotateCcw className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>جلب البث المباشر الفوري...</span>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-3 z-10">
            <p className="text-xs text-rose-400 font-medium max-w-sm">{errorMessage}</p>
            <button
              onClick={loadStream}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة الآن</span>
            </button>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Live Indicator */}
            <div className="px-2.5 py-1 rounded-xl bg-rose-600/90 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>مباشر LIVE</span>
            </div>

            {/* Quality badge */}
            <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-mono border border-white/10">
              {qualityMode === 'low_data' ? '⚡ وضع السرعة والنت الضعيف' : 'سحب تلقائي سريع'}
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Aspect ratio */}
            <button
              onClick={() => setAspectFit(aspectFit === 'contain' ? 'cover' : 'contain')}
              className="px-2 py-1 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white text-[10px] font-medium transition cursor-pointer"
              title="تغيير أبعاد الشاشة"
            >
              {aspectFit === 'contain' ? 'توسيط' : 'ملء الشاشة'}
            </button>
          </div>
        </div>

        {/* Bottom Overlay Controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 flex items-center justify-between text-white z-10">
          
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              id="player-play-toggle-btn"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition cursor-pointer"
              aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              id="player-mute-toggle-btn"
              onClick={toggleMute}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition cursor-pointer"
              aria-label={isMuted ? 'إلغاء الكتم' : 'كتم'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onPrevChannel}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer hidden sm:flex"
              title="القناة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNextChannel}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer hidden sm:flex"
              title="القناة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* AirPlay TV Casting */}
            <button
              id="player-airplay-btn"
              onClick={triggerAirPlay}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/30 active:scale-95 transition cursor-pointer"
              title="بث تلفزيوني AirPlay"
            >
              <Cast className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">بث للتلفاز</span>
              <span className="sm:hidden">AirPlay</span>
            </button>

            {/* Picture in Picture */}
            <button
              id="player-pip-btn"
              onClick={togglePiP}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer"
              title="نافذة عائمة (Picture in Picture)"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              id="player-fullscreen-btn"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer"
              title="ملء الشاشة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* CHANNEL DETAILS & QUALITY CONTROLS BAR */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Channel Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <Tv className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {channel.name}
              </h2>
              <button
                onClick={() => onToggleFavorite(channel.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition cursor-pointer"
                title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {channel.group}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                متصل بـ CarPlay
              </span>
            </div>
          </div>
        </div>

        {/* Speed / Quality Mode Selector Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs">
            <button
              onClick={() => onChangeQualityMode('auto')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                qualityMode === 'auto'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>تلقائي سريع</span>
            </button>

            <button
              onClick={() => onChangeQualityMode('low_data')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                qualityMode === 'low_data'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="سحب خفيف جداً يضمن تشغيل الفيديو حتى على أضعف شبكة إنترنت"
            >
              <Zap className="w-3 h-3" />
              <span>النت الضعيف (0 تقطيع)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
