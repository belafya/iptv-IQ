import React from 'react';
import { Tv, Wifi, WifiOff, Car, Plus, Download, Check, Sparkles, SlidersHorizontal } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  isOnline: boolean;
  onOpenAddSource: () => void;
  onOpenCarPlayGuide: () => void;
  onOpenIOSGuide: () => void;
  workingCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  onOpenAddSource,
  onOpenCarPlayGuide,
  onOpenIOSGuide,
  workingCount,
  totalCount,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 select-none shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/10">
            <Tv className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-slate-900 font-sans">
                IPTV <span className="text-emerald-600">IQ</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{isOnline ? 'بث فوري مباشر' : 'غير متصل بالإنترنت'}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">
                {workingCount} قناة نشطة
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2">
          
          {/* Add M3U Source Button */}
          <button
            id="add-m3u-source-nav-btn"
            onClick={onOpenAddSource}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="إضافة رابط M3U أو ملف قنوات"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span className="hidden sm:inline">إضافة مصدر</span>
            <span className="sm:hidden">مصدر</span>
          </button>

          {/* CarPlay / AirPlay Guide Button */}
          <button
            id="carplay-guide-nav-btn"
            onClick={onOpenCarPlayGuide}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="توصيل وتشغيل السيارة و AirPlay"
          >
            <Car className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CarPlay & AirPlay</span>
            <span className="sm:hidden">CarPlay</span>
          </button>

          {/* PWA Install Button */}
          {isInstalled ? (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>مثبت</span>
            </div>
          ) : isInstallable ? (
            <button
              id="install-pwa-nav-btn"
              onClick={install}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>تثبيت التطبيق</span>
            </button>
          ) : (
            <button
              id="install-ios-nav-btn"
              onClick={onOpenIOSGuide}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs transition active:scale-95 cursor-pointer"
              title="تثبيت التطبيق على الشاشة الرئيسية للايفون"
            >
              <Download className="w-4 h-4 text-emerald-600" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
