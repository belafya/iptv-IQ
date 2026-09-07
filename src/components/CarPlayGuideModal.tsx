import React from 'react';
import { X, Car, Cast, Volume2, ShieldCheck, Smartphone, Radio, Play, CheckCircle2 } from 'lucide-react';
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
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xl text-right text-slate-800 relative flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">تشغيل في السيارة والتلفاز</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Apple CarPlay & AirPlay Stream</p>
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
            <div className="py-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
              
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تكامل تلقائي مع شاشة وأزرار سيارتك (MediaSession):</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  تم ضبط المشغل لإرسال إشارة الصوت وشعار القناة واسمها تلقائياً إلى نظام CarPlay والبلوتوث في السيارة.
                </p>
              </div>

              {/* Step 1: CarPlay */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>1. في السيارة (CarPlay / Bluetooth):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • عند توصيل هاتفك بكابل CarPlay أو البلوتوث، يشتغل صوت القناة الحية فوراً عبر سماعات السيارة.
                  <br />
                  • يمكنك التبديل بين القنوات أو إيقاف وتشغيل البث من شاشة السيارة أو أزرار المقود.
                </p>
              </div>

              {/* Step 2: AirPlay TV */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Cast className="w-4 h-4 text-emerald-600" />
                  <span>2. على التلفاز الذكي (AirPlay TV):</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • اضغط زر <strong className="text-emerald-700">«بث للتلفاز»</strong> في مشغل الفيديو.
                  <br />
                  • اختر شاشة التلفاز الذكي (Apple TV / Samsung / LG) ليبدأ بث الفيديو والصوت عالي الدقة بدون أي تأخير.
                </p>
              </div>

              {/* Step 3: Low Data */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>3. وضع النت الضعيف أثناء التنقل:</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • إذا كنت تقود في مناطق ذات تغطية إنترنت ضعيفة، قم بتفعيل خيار <strong className="text-emerald-700">«النت الضعيف»</strong> أسفل المشغل لضمان استمرار البث دون أي تقطيع.
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
