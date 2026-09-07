import React from 'react';
import { Share, PlusSquare, X, CheckCircle2, Smartphone, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="ios-install-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-none">
          <motion.div
            id="ios-install-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xl text-right text-slate-800 relative overflow-hidden"
          >
            {/* Close button */}
            <button
              id="close-ios-guide-button"
              onClick={onClose}
              className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">تثبيت IPTV IQ على الآيفون</h3>
                <p className="text-xs text-slate-500 mt-0.5">تطبيق رسمي على الشاشة الرئيسية</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              لتثبيت التطبيق وفتحه كشاشة كاملة سريعة بدون متصفح مع حفظ القنوات محلياً:
            </p>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">١. اضغط زر المشاركة (Share) في Safari</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">في الشريط السفلي لمتصفح Safari.</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">٢. اختر «إضافة إلى الصفحة الرئيسية»</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">مرر القائمة واضغط «Add to Home Screen».</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">٣. اضغط «إضافة» (Add) في الزاوية</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">ستظهر أيقونة IPTV IQ وتعمل كتطبيق رسمي.</div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              id="got-it-ios-guide-button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
            >
              فهمت ذلك
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
