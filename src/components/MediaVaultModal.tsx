import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Folder,
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
  Share2,
  Trash2,
  Play,
  CheckCircle2,
  Sparkles,
  Smartphone,
  HardDrive,
  Download,
  AlertCircle,
  Maximize2,
  Eye,
  ShieldCheck,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocalMediaItem } from '../types';
import {
  getAllMediaItems,
  saveMediaFile,
  deleteMediaItem,
  exportToIPhoneFiles,
  formatBytes,
} from '../utils/localMediaVault';

interface MediaVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayLocalVideo?: (mediaItem: LocalMediaItem) => void;
}

export const MediaVaultModal: React.FC<MediaVaultModalProps> = ({
  isOpen,
  onClose,
  onPlayLocalVideo,
}) => {
  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'video' | 'image'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Official iOS permission prompt state
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Active Lightbox for Image
  const [activeImage, setActiveImage] = useState<LocalMediaItem | null>(null);

  // Active Video Player
  const [activeVideo, setActiveVideo] = useState<LocalMediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load files on open
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    try {
      const items = await getAllMediaItems();
      setMediaItems(items);
    } catch (err) {
      console.error('Failed to load media vault:', err);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Trigger permission prompt before opening native picker
  const handleInitiateImport = () => {
    setShowPermissionPrompt(true);
  };

  // User confirmed permission in iOS dialog -> open system photo picker
  const handlePermissionConfirmed = () => {
    setShowPermissionPrompt(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle files selected from native iOS Photo Library
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSaving(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setSavingProgress(`جارِ حفظ ${i + 1} من ${files.length} في مجلد IPTV IQ...`);
      try {
        await saveMediaFile(file);
        successCount++;
      } catch (err) {
        console.error('Error saving file:', file.name, err);
      }
    }

    setIsSaving(false);
    setSavingProgress('');
    e.target.value = ''; // Reset input
    await loadMedia();
    showToast(`تم استرداد وحفظ ${successCount} ملفات بنجاح في مجلد IPTV IQ!`);
  };

  // Delete an item
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل تريد بالتأكيد حذف هذا الملف من مجلد IPTV IQ؟')) {
      await deleteMediaItem(id);
      await loadMedia();
      showToast('تم حذف الملف من مجلد IPTV IQ');
    }
  };

  // Export item to iPhone Files app
  const handleExport = async (item: LocalMediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('جارِ فتح نافذة حفظ في ملفات الآيفون...');
    const ok = await exportToIPhoneFiles(item);
    if (ok) {
      showToast('تم تجهيز الملف للحفظ في مجلد IPTV IQ بتطبيق الملفات!');
    }
  };

  // Filtered media items
  const filteredItems = mediaItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const totalBytes = mediaItems.reduce((acc, curr) => acc + curr.size, 0);
  const videoCount = mediaItems.filter((i) => i.type === 'video').length;
  const imageCount = mediaItems.filter((i) => i.type === 'image').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl text-right text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <Folder className="w-5 h-5 fill-blue-500/20" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    ملفات ووسائط الآيفون (مجلد IPTV IQ)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    محلي ورسمي
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  استرداد وحفظ الفيديوهات والصور محلياً عبر صور وملفات الآيفون
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner shrink-0">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Sub-Header: Path breadcrumb & Actions */}
          <div className="px-4 sm:px-5 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
            {/* iOS Folder Path Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>ملفات الهاتف</span>
                <span>/</span>
                <span className="font-bold text-blue-700">IPTV IQ</span>
              </div>
              <span className="text-[11px] text-slate-500">
                ({formatBytes(totalBytes)} • {mediaItems.length} ملفات)
              </span>
            </div>

            {/* Import Button */}
            <button
              onClick={handleInitiateImport}
              disabled={isSaving}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>استرداد من صور وفيديوهات الآيفون</span>
            </button>

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>

          {/* Saving Progress Banner */}
          {isSaving && (
            <div className="p-3 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs flex items-center justify-center gap-2 shrink-0">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>{savingProgress}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="px-4 sm:px-5 pt-3 pb-1 flex items-center gap-2 border-b border-slate-100 shrink-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({mediaItems.length})
            </button>
            <button
              onClick={() => setSelectedFilter('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                selectedFilter === 'video'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>فيديوهات ({videoCount})</span>
            </button>
            <button
              onClick={() => setSelectedFilter('image')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                selectedFilter === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>صور ({imageCount})</span>
            </button>
          </div>

          {/* Scrollable Media Grid */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-[300px]">
            {filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Folder className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="max-w-xs space-y-1">
                  <p className="text-sm font-bold text-slate-800">لا توجد ملفات في مجلد IPTV IQ حالياً</p>
                  <p className="text-xs text-slate-500">
                    اضغط زر «استرداد من صور وفيديوهات الآيفون» لاختيار صور وتسجيلات وحفظها في مجلد التطبيق الرسمي.
                  </p>
                </div>
                <button
                  onClick={handleInitiateImport}
                  className="mt-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                >
                  طلب إذن واسترداد وسائط الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex flex-col shadow-2xs hover:shadow-md transition"
                  >
                    {/* Media Thumbnail Box */}
                    <div
                      onClick={() => {
                        if (item.type === 'video') {
                          setActiveVideo(item);
                        } else {
                          setActiveImage(item);
                        }
                      }}
                      className="relative w-full aspect-video bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center">
                          {item.type === 'video' ? <Film className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                        </div>
                      )}

                      {/* Type Badge & Duration */}
                      <div className="absolute top-2 right-2">
                        {item.type === 'video' ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                            <VideoIcon className="w-2.5 h-2.5" />
                            فيديو
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            صورة
                          </span>
                        )}
                      </div>

                      {/* Play overlay for video */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
                          <div className="w-9 h-9 rounded-full bg-white/90 text-emerald-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play className="w-4 h-4 fill-emerald-600 translate-x-[-1px]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta info & Action buttons */}
                    <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{formatBytes(item.size)}</p>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        {/* Play / View */}
                        <button
                          onClick={() => {
                            if (item.type === 'video') {
                              if (onPlayLocalVideo) {
                                onPlayLocalVideo(item);
                                onClose();
                              } else {
                                setActiveVideo(item);
                              }
                            } else {
                              setActiveImage(item);
                            }
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                          title={item.type === 'video' ? 'تشغيل الفيديو' : 'عرض الصورة'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{item.type === 'video' ? 'تشغيل' : 'عرض'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Export to iOS Files */}
                          <button
                            onClick={(e) => handleExport(item, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-blue-700 transition"
                            title="حفظ في تطبيق ملفات الآيفون"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>يتم تخزين جميع الملفات محلياً على جهازك في مجلد IPTV IQ بأمان تام.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </motion.div>

        {/* 1. Official iOS System Permission Dialog */}
        {showPermissionPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl space-y-4 text-slate-900 border border-slate-200"
            >
              {/* Apple Photos Icon */}
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-rose-500">
                  <ImageIcon className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <h4 className="text-base font-black text-center text-slate-900">
                  «IPTV IQ» يرغب في الوصول إلى صور وفيديوهات الآيفون
                </h4>
                <p className="text-xs text-slate-600 text-center leading-relaxed">
                  يطلب التطبيق إذنك للوصول إلى مكتبة الصور (Photos Library) لاسترداد الفيديوهات والصور وحفظها محلياً داخل مجلد <strong>'IPTV IQ'</strong> في جهازك لتشغيلها والاحتفاظ بها دون إنترنت وبشكل رسمي.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handlePermissionConfirmed}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-98 cursor-pointer"
                >
                  السماح بالوصول الكامل ومتابعة
                </button>
                <button
                  onClick={handlePermissionConfirmed}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  تحديد صور وفيديوهات محددة
                </button>
                <button
                  onClick={() => setShowPermissionPrompt(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  عدم السماح / إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Fullscreen Image Lightbox Viewer */}
        {activeImage && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4">
            <div className="w-full flex items-center justify-between text-white max-w-4xl">
              <div className="text-right">
                <h4 className="text-sm font-bold">{activeImage.name}</h4>
                <p className="text-[11px] text-slate-400">
                  مجلد IPTV IQ • {formatBytes(activeImage.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleExport(activeImage, e)}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>حفظ بالملفات</span>
                </button>
                <button
                  onClick={() => setActiveImage(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center max-w-4xl w-full p-2">
              <img
                src={activeImage.url || activeImage.thumbnail}
                alt={activeImage.name}
                className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* 3. Fullscreen Video Preview Player */}
        {activeVideo && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4">
            <div className="w-full flex items-center justify-between text-white max-w-4xl">
              <div className="text-right">
                <h4 className="text-sm font-bold">{activeVideo.name}</h4>
                <p className="text-[11px] text-slate-400">
                  فيديو من مجلد IPTV IQ • {formatBytes(activeVideo.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onPlayLocalVideo && (
                  <button
                    onClick={() => {
                      onPlayLocalVideo(activeVideo);
                      setActiveVideo(null);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>تشغيل بالمشغل الرئيسي</span>
                  </button>
                )}
                <button
                  onClick={(e) => handleExport(activeVideo, e)}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>حفظ بالملفات</span>
                </button>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center max-w-4xl w-full p-2">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                playsInline
                x-webkit-airplay="allow"
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl bg-black"
              />
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
