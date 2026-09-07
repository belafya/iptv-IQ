import React from 'react';
import { X, Tv, Cast, Smartphone, CheckCircle2, ArrowLeft, RefreshCw, Zap, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TVAirPlayFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconnectStream?: () => void;
}

export const TVAirPlayFixModal: React.FC<TVAirPlayFixModalProps> = ({
  isOpen,
  onClose,
  onReconnectStream,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xl text-right text-slate-800 relative flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">حل مشكلة تعليق البث على شاشة التلفاز</h3>
                <p className="text-[11px] text-amber-600 font-semibold">حل شاشة «جاري تحميل الفيديو...» نهائياً</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Root Cause Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>لماذا يظهر «جاري تحميل الفيديو» ويتأخر التلفاز؟</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              شاشات التلفاز الذكية (Samsung, LG, Sony, Apple TV) عند استقبال رابط البث المباشر الفضائي، تحاول فتح الرابط مباشرة بمتصفح التلفاز الداخلي البطيء، مما يسبب تأخيراً طويلاً أو شاشة سوداء.
            </p>
          </div>

          {/* Guaranteed Solution: Screen Mirroring */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wide">
                الحل الأسرع والأضمن 100%
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>انعكاس الشاشة (Screen Mirroring)</span>
              </div>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              هذه الطريقة تجعل الآيفون هو من يعالج الفيديو بأعلى دقة ويرسله للتلفاز في أجزاء من الثانية <strong>(صفر ثواني انتظار وبدون أي تعليق)</strong>:
            </p>

            {/* 3 Step Visual Guide */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/90 border border-emerald-200/70 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  1
                </div>
                <p className="text-slate-800 text-[11px]">
                  اسحب الشاشة من <strong>الزاوية العلوية اليمنى</strong> للآيفون لفتح <strong>«مركز التحكم (Control Center)»</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/90 border border-emerald-200/70 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-[11px] text-slate-800 flex items-center gap-1.5 flex-wrap">
                  <span>اضغط على أيقونة</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">
                    <Layers className="w-3 h-3 text-emerald-600" />
                    انعكاس الشاشة
                  </span>
                  <span>(المستطيلين المتطابقين).</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/90 border border-emerald-200/70 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  3
                </div>
                <p className="text-slate-800 text-[11px]">
                  اختر شاشة التلفاز الذكي الخاص بك (مثل Samsung TV أو LG أو Apple TV) وسيظهر البث فوراً ملء الشاشة!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Reconnect / Stream Refresh Action */}
          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            {onReconnectStream && (
              <button
                onClick={() => {
                  onReconnectStream();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحديث البث المباشر للتلفاز الآن</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
