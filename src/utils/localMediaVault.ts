import { LocalMediaItem } from '../types';

const DB_NAME = 'iptv_iq_vault_db';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;
const OPFS_DIR_NAME = 'IPTV IQ';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('addedAt', 'addedAt', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Ensure OPFS 'IPTV IQ' folder is created
async function getOPFSDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage) {
    try {
      const root = await navigator.storage.getDirectory();
      return await root.getDirectoryHandle(OPFS_DIR_NAME, { create: true });
    } catch (err) {
      console.warn('OPFS directory access error, falling back to IndexedDB:', err);
    }
  }
  return null;
}

// Generate thumbnail for image or video
async function generateThumbnail(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  if (file.type.startsWith('video/')) {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.currentTime = 1;

        video.onloadeddata = () => {
          video.currentTime = Math.min(1, video.duration / 2 || 0);
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumb = canvas.toDataURL('image/jpeg', 0.7);
              URL.revokeObjectURL(url);
              resolve(thumb);
              return;
            }
          } catch {}
          URL.revokeObjectURL(url);
          resolve('');
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('');
        };

        // Timeout fallback
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve('');
        }, 2500);
      } catch {
        resolve('');
      }
    });
  }

  return '';
}

// Save a single file into IndexedDB and OPFS 'IPTV IQ' directory
export async function saveMediaFile(file: File): Promise<LocalMediaItem> {
  const isVideo = file.type.startsWith('video/');
  const type: 'video' | 'image' = isVideo ? 'video' : 'image';
  const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const thumbnail = await generateThumbnail(file);

  // 1. Save to OPFS 'IPTV IQ' folder
  try {
    const dirHandle = await getOPFSDirectory();
    if (dirHandle) {
      const fileHandle = await dirHandle.getFileHandle(`${id}_${file.name}`, { create: true });
      const writable = await (fileHandle as any).createWritable();
      await writable.write(file);
      await writable.close();
    }
  } catch (err) {
    console.warn('Could not save to OPFS directly:', err);
  }

  // 2. Save into IndexedDB
  const item: LocalMediaItem = {
    id,
    name: file.name,
    type,
    mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    size: file.size,
    addedAt: Date.now(),
    blob: file,
    thumbnail,
  };

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Create temporary object URL for immediate in-session playback
  item.url = URL.createObjectURL(file);
  return item;
}

// Retrieve all media items sorted by newest first
export async function getAllMediaItems(): Promise<LocalMediaItem[]> {
  try {
    const db = await openDB();
    const items = await new Promise<LocalMediaItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    // Populate URLs for active sessions
    return items
      .map((item) => {
        if (item.blob) {
          try {
            item.url = URL.createObjectURL(item.blob);
          } catch {}
        }
        return item;
      })
      .sort((a, b) => b.addedAt - a.addedAt);
  } catch (err) {
    console.error('Failed to get media items:', err);
    return [];
  }
}

// Delete media item from IndexedDB and OPFS
export async function deleteMediaItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Cleanup OPFS
    try {
      const dirHandle = await getOPFSDirectory();
      if (dirHandle) {
        for await (const name of (dirHandle as any).keys()) {
          if (name.startsWith(id)) {
            await dirHandle.removeEntry(name);
          }
        }
      }
    } catch {}
  } catch (err) {
    console.error('Failed to delete media item:', err);
  }
}

// Export a file to iPhone "Files" app (تطبيق ملفات الآيفون)
export async function exportToIPhoneFiles(item: LocalMediaItem): Promise<boolean> {
  if (!item.blob) return false;

  const file = new File([item.blob], item.name, { type: item.mimeType });

  // Web Share API (Triggers iOS native "حفظ في الملفات" (Save to Files) -> مجلد IPTV IQ)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: item.name,
        text: 'حفظ الملف في تطبيق ملفات الآيفون داخل مجلد IPTV IQ',
      });
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
      console.warn('Share API failed, falling back to download:', err);
    }
  }

  // Fallback: Trigger browser download with anchor tag
  try {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch {
    return false;
  }
}

// Format bytes into readable Arabic/English units
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
