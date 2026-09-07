import React from 'react';
import {
  X,
  Car,
  Cast,
  Volume2,
  ShieldCheck,
  Smartphone,
  Radio,
  Play,
  CheckCircle2,
  Lock,
  PictureInPicture2,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarPlayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CarPlayGuideModal: React.FC<CarPlayGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="carplay-guide-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            id="carplay-guide-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xl text-right text-slate-800 relative flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Cast className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">تشغيل التلفاز والخلفية بدون انقطاع</h3>
                  <p className="text-[11px] text-slate-500 font-medium">AirPlay • Background Playback • CarPlay</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              
              {/* Feature highlight banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ميزة البث المستمر في الخلفية (Background Keep-Alive):</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  تم تفعيل جسر تشغيل صوتي وتقني مخصص لأجهزة الآيفون (iOS) يمنع النظام من إيقاف البث أو فصل اتصال التلفاز عند قفل الشاشة أو فتح تطبيقات أخرى.
                </p>
              </div>

              {/* Step 1: Continuous TV AirPlay */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Cast className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1. البث على شاشة التلفاز الذكي (AirPlay):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • اضغط زر <strong className="text-emerald-700">«بث للتلفاز»</strong> في شريط المشغل، واختر شاشة التلفاز (Apple TV / Samsung / LG / Sony).
                  <br />
                  • سيبقى البث مستمراً على شاشة التلفاز حتى لو قفلت شاشة الآيفون أو خرجت من المتصفح.
                </p>
              </div>

              {/* Step 2: Lock Screen & Control Center */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2. التحكم من شاشة القفل ومركز التحكم (Lock Screen):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • عند قفل الهاتف، ستظهر بطاقة القناة مع شعارها وأزرار (التشغيل / الإيقاف / التنقل بين القنوات) مباشرة في شاشة القفل ومركز التحكم (Control Center).
                </p>
              </div>

              {/* Step 3: Floating PiP Window */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <PictureInPicture2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3. ميزة النافذة العائمة (Picture in Picture):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • اضغط أيقونة النافذة العائمة لمشاهدة القناة في نافذة صغيرة تطفو فوق تطبيق الواتساب، التيك توك، أو متصفحات أخرى.
                </p>
              </div>

              {/* Step 4: CarPlay In Vehicle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>4. شاشة وأزرار مقود السيارة (Apple CarPlay):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • يندمج التطبيق تلقائياً مع نظام CarPlay لنقل الصوت عالي النقاء وسماع نشرات الأخبار والمباريات مع التبديل من المقود.
                </p>
              </div>

            </div>

            {/* Bottom Close Button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition active:scale-98 cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

