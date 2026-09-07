import React from 'react';
import { WifiOff, RefreshCw, AlertCircle, Database } from 'lucide-react';

interface OfflineBannerProps {
  onRetry: () => void;
  cachedCount: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry, cachedCount }) => {
  return (
    <div className="w-full bg-amber-50 border border-amber-200/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-amber-950">أنت غير متصل بالإنترنت حالياً</h3>
            <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 text-[10px] font-bold">
              وضع عدم الاتصال
            </span>
          </div>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
            يرجى الاتصال بشبكة Wi-Fi أو تفعيل بيانات الهاتف لإعادة تشغيل البث المباشر. (تتوفر {cachedCount} قناة محفوظة محلياً).
          </p>
        </div>
      </div>

      <button
        onClick={onRetry}
        className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>إعادة المحاولة والتحديث</span>
      </button>
    </div>
  );
};
