import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileText,
  Link,
  UploadCloud,
  AlertTriangle,
  Tv,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_ARABIC_M3U_URL, CURATED_IPTV_CHANNELS } from '../data/curatedChannels';
import { fetchAndParseM3U, parseM3U } from '../utils/m3uParser';
import { IPTVChannel } from '../types';
import { saveChannelsLocally, loadSavedChannels } from '../utils/streamOptimizer';

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
  const [sourceType, setSourceType] = useState<'url' | 'text' | 'file'>('url');
  const [sourceUrl, setSourceUrl] = useState<string>(DEFAULT_ARABIC_M3U_URL);
  const [rawText, setRawText] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [channelCountFound, setChannelCountFound] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setIsError(false);
    setStatusMessage(`جارِ قراءة الملف: ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          throw new Error('الملف فارغ');
        }
        const channels = parseM3U(content);
        if (channels.length === 0) {
          throw new Error('لم يتم العثور على قنوات صالحة داخل الملف');
        }
        setRawText(content);
        setChannelCountFound(channels.length);
        setStatusMessage(`تم العثور على ${channels.length} قناة داخل ملف ${file.name}`);
        setIsLoading(false);
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`خطأ في قراءة الملف: ${err.message}`);
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setIsError(true);
      setStatusMessage('تعذر قراءة الملف من جهازك');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsLoading(true);
    setIsError(false);
    setStatusMessage('جارِ الاتصال وفحص القنوات عبر خوادم كسر الحظر السريعة...');
    setChannelCountFound(null);

    try {
      let parsed: IPTVChannel[] = [];

      if (sourceType === 'url') {
        const clean = sourceUrl.trim();
        if (!clean) {
          throw new Error('يرجى إدخال رابط M3U صحيح');
        }
        parsed = await fetchAndParseM3U(clean);
      } else {
        const textToParse = rawText.trim();
        if (!textToParse) {
          throw new Error('يرجى إدخال أو لصق محتوى قائمة القنوات M3U');
        }
        parsed = parseM3U(textToParse);
      }

      if (parsed.length === 0) {
        throw new Error('لم يتم العثور على أي قنوات شغالة في هذا المصدر.');
      }

      // Merge or replace
      let finalChannels: IPTVChannel[] = [];
      const currentStored = loadSavedChannels(CURATED_IPTV_CHANNELS);

      if (importMode === 'merge') {
        const existingMap = new Map(currentStored.map((c) => [c.url, c]));
        // Add new channels while preserving existing
        parsed.forEach((p) => {
          if (!existingMap.has(p.url)) {
            existingMap.set(p.url, p);
          }
        });
        finalChannels = Array.from(existingMap.values());
      } else {
        // Replace all
        finalChannels = parsed;
      }

      // Save locally and update parent
      saveChannelsLocally(finalChannels);
      onChannelsUpdated(finalChannels);
      setChannelCountFound(parsed.length);
      setIsError(false);
      setStatusMessage(
        `تم استيراد ${parsed.length} قناة بنجاح! الإجمالي الآن: ${finalChannels.length} قناة.`
      );

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(err.message || 'تعذر استيراد القنوات، يرجى التأكد من صحة الرابط أو لصق النص مباشرة.');
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
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xl text-right text-slate-800 relative flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar space-y-4"
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                id="execute-add-source-btn"
                onClick={handleImport}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                {isLoading ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[3]" />
                )}
                <span>استيراد القنوات</span>
              </button>

              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tv className="w-4 h-4 text-emerald-600" />
                <span>إضافة مصدر IPTV / M3U</span>
              </h2>

              <button
                id="close-add-source-modal-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Type Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSourceType('url')}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  sourceType === 'url' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>رابط M3U أونلاين</span>
              </button>

              <button
                onClick={() => setSourceType('text')}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  sourceType === 'text' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>لصق نص مباشر</span>
              </button>

              <button
                onClick={() => {
                  setSourceType('file');
                  fileInputRef.current?.click();
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  sourceType === 'file' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>رفع ملف جهازك</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".m3u,.m3u8,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Input Area Depending on Source Type */}
            {sourceType === 'url' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  رابط قائمة التشغيل M3U / M3U8 (مدعوم بتخطي حظر CORS التلقائي):
                </label>
                <div className="relative rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition p-3 shadow-inner">
                  <textarea
                    id="source-m3u-textarea"
                    value={sourceUrl}
                    onChange={(e) => {
                      setSourceUrl(e.target.value);
                      setIsError(false);
                      setStatusMessage(null);
                    }}
                    rows={3}
                    placeholder="https://example.com/playlist.m3u8 أو رابط السيرفر الخاص بك"
                    className="w-full bg-transparent text-xs text-emerald-900 font-mono focus:outline-none resize-none no-scrollbar font-medium"
                    dir="ltr"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSourceUrl(DEFAULT_ARABIC_M3U_URL);
                        setIsError(false);
                        setStatusMessage('تم استرجاع رابط القنوات العربية الرسمي');
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>استعادة باقة القنوات العربية الرسمية</span>
                    </button>
                    <span className="text-slate-400 font-mono text-[10px]">M3U / M3U8</span>
                  </div>
                </div>
              </div>
            ) : sourceType === 'text' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  الصق محتوى نص M3U هنا مباشرة:
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setIsError(false);
                    setStatusMessage(null);
                  }}
                  rows={5}
                  placeholder={`#EXTM3U\n#EXTINF:-1 tvg-logo="https://..." group-title="الأخبار",قناة الجزيرة\nhttp://example.com/stream.m3u8`}
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white p-3 text-xs font-mono text-slate-800 outline-none resize-none transition shadow-inner font-medium"
                  dir="ltr"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-emerald-50/40 transition cursor-pointer space-y-2"
              >
                <UploadCloud className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="text-xs font-bold text-slate-800">انقر هنا لاختيار ملف .m3u أو .m3u8 من جهازك</p>
                <p className="text-[11px] text-slate-500">يعمل بدون الحاجة للاتصال بالإنترنت</p>
              </div>
            )}

            {/* Merge vs Replace Mode */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>طريقة إضافة القنوات:</span>
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="accent-emerald-600"
                  />
                  <span>دمج مع القنوات الحالية</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-emerald-600"
                  />
                  <span>استبدال الكل</span>
                </label>
              </div>
            </div>

            {/* Status Card */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isError
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isError ? (
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-snug">{statusMessage}</p>
                    {channelCountFound !== null && (
                      <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        جاهز للاستمتاع بالقنوات الجديدة
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>جارِ الاستيراد والحفظ...</span>
                  </>
                ) : (
                  <span>تأكيد وحفظ القنوات</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

