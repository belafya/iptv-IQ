import React, { useState } from 'react';
import { X, Plus, CheckCircle2, RotateCcw, Sparkles, ShieldCheck, FileText, Link, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_ARABIC_M3U_URL, CURATED_IPTV_CHANNELS } from '../data/curatedChannels';
import { fetchAndParseM3U, parseM3U } from '../utils/m3uParser';
import { IPTVChannel } from '../types';
import { saveChannelsLocally } from '../utils/streamOptimizer';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelsUpdated: (channels: IPTVChannel[]) => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onChannelsUpdated,
}) => {
  const [sourceUrl, setSourceUrl] = useState<string>(DEFAULT_ARABIC_M3U_URL);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>('تم العثور على رابط اشتراك واحد');
  const [isError, setIsError] = useState<boolean>(false);

  const handleImport = async () => {
    if (!sourceUrl.trim()) return;
    setIsLoading(true);
    setIsError(false);
    setStatusMessage('جارِ فحص وتحميل القنوات...');

    try {
      let parsed: IPTVChannel[] = [];
      if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
        parsed = await fetchAndParseM3U(sourceUrl.trim());
      } else {
        parsed = parseM3U(sourceUrl);
      }

      if (parsed.length > 0) {
        // Merge with verified channels to guarantee top reliability
        const combined = [...CURATED_IPTV_CHANNELS, ...parsed.filter((p) => !CURATED_IPTV_CHANNELS.some((c) => c.id === p.id))];
        saveChannelsLocally(combined);
        onChannelsUpdated(combined);
        setStatusMessage(`تم استيراد ${combined.length} قناة بنجاح وحفظها محلياً!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setIsError(true);
        setStatusMessage('لم يتم العثور على قنوات صالحة في الرابط.');
      }
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`خطأ: ${err.message || 'تعذر جلب المصدر'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="add-source-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            id="add-source-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xl text-right text-slate-800 relative flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button
                id="execute-add-source-btn"
                onClick={handleImport}
                disabled={isLoading}
                className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                {isLoading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                <span>إضافة</span>
              </button>

              <h2 className="text-base font-black text-slate-900">إضافة مصدر</h2>

              <button
                id="close-add-source-modal-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction text */}
            <div className="py-3 space-y-3 text-xs leading-relaxed text-slate-600">
              <p>
                الصق رابط اشتراك أو ملف إعداد أو محتوى M3U للتعرف التلقائي، أو استورد باقة القنوات الرسمية:
              </p>

              {/* URL input area */}
              <div className="relative rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition p-3.5 shadow-inner">
                <textarea
                  id="source-m3u-textarea"
                  value={sourceUrl}
                  onChange={(e) => {
                    setSourceUrl(e.target.value);
                    if (e.target.value.includes('http')) {
                      setStatusMessage('تم العثور على رابط اشتراك');
                      setIsError(false);
                    }
                  }}
                  rows={3}
                  placeholder="https://iptv-org.github.io/iptv/regions/arab.m3u"
                  className="w-full bg-transparent text-xs text-emerald-800 font-mono focus:outline-none resize-none no-scrollbar font-medium"
                  dir="ltr"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceUrl(DEFAULT_ARABIC_M3U_URL);
                      setStatusMessage('تم العثور على رابط اشتراك واحد');
                      setIsError(false);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>استعادة رابط القنوات العربية الرسمي</span>
                  </button>
                  <span className="text-slate-400 font-mono text-[10px]">M3U / M3U8</span>
                </div>
              </div>

              {/* Status Card (Matches user's screenshot layout) */}
              {statusMessage && (
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isError ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{statusMessage}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[260px]" dir="ltr">
                        {sourceUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Information & Disclaimer */}
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تخزين محلي فائق السرعة:</span>
                </div>
                <p>
                  يتم حفظ جميع القنوات والمصادر محلياً في ذاكرة جهازك بحيث تفتح فوراً حتى بدون الحاجة لإعادة التنزيل عند كل تشغيل.
                </p>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-2">
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition cursor-pointer"
              >
                تأكيد وحفظ القنوات
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
