import { IPTVChannel } from '../types';
import { CURATED_IPTV_CHANNELS, DEFAULT_ARABIC_M3U_URL } from '../data/curatedChannels';

export { DEFAULT_ARABIC_M3U_URL };

// Multi-tier CORS Proxies to guarantee remote M3U URL access from browser
const CORS_PROXIES = [
  (url: string) => url, // Direct first
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Robust parser for M3U / M3U8 playlists with support for various IPTV formats,
 * Xtream Codes output, direct links, and custom tags.
 */
export function parseM3U(content: string): IPTVChannel[] {
  if (!content || typeof content !== 'string') return [];

  // Remove UTF-8 BOM if present
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xfeff) {
    cleanContent = cleanContent.slice(1);
  }

  const lines = cleanContent.split(/\r?\n/);
  const channels: IPTVChannel[] = [];
  let currentInfo: Partial<IPTVChannel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentInfo = {};

      // Parse tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i) || line.match(/tvg-logo=([^\s,]+)/i);
      if (logoMatch) currentInfo.logo = logoMatch[1].trim();

      // Parse group-title or category
      const groupMatch = line.match(/group-title="([^"]+)"/i) || line.match(/group-title=([^\s,]+)/i);
      if (groupMatch) {
        currentInfo.group = groupMatch[1].trim();
      } else {
        currentInfo.group = 'عام';
      }

      // Parse tvg-country
      const countryMatch = line.match(/tvg-country="([^"]+)"/i) || line.match(/tvg-country=([^\s,]+)/i);
      if (countryMatch) currentInfo.country = countryMatch[1].trim();

      // Parse channel name: text after the last comma
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1 && commaIndex < line.length - 1) {
        const extractedName = line.substring(commaIndex + 1).trim();
        if (extractedName) {
          currentInfo.name = extractedName;
        }
      }

      // Fallback name if missing
      if (!currentInfo.name) {
        const tvgNameMatch = line.match(/tvg-name="([^"]+)"/i) || line.match(/tvg-name=([^\s,]+)/i);
        if (tvgNameMatch) {
          currentInfo.name = tvgNameMatch[1].trim();
        } else {
          currentInfo.name = `قناة ${channels.length + 1}`;
        }
      }
    } else if (!line.startsWith('#')) {
      // Stream URL line
      const isValidUrl =
        line.startsWith('http://') ||
        line.startsWith('https://') ||
        line.startsWith('rtmp://') ||
        line.startsWith('mms://');

      if (isValidUrl) {
        let channelName = currentInfo?.name;
        if (!channelName) {
          // Attempt to derive name from URL
          try {
            const urlObj = new URL(line);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            channelName = pathParts[pathParts.length - 1]?.replace(/\.[^/.]+$/, '') || `قناة ${channels.length + 1}`;
          } catch {
            channelName = `قناة ${channels.length + 1}`;
          }
        }

        const channelGroup = currentInfo?.group || 'عام';
        const channelLogo = currentInfo?.logo;
        const channelCountry = currentInfo?.country;

        channels.push({
          id: `ch-${channels.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
          name: channelName,
          logo: channelLogo,
          group: channelGroup,
          country: channelCountry,
          url: line,
          isVerified: true,
          status: 'working',
        });
      }

      currentInfo = null;
    }
  }

  return channels;
}

/**
 * Fetch and parse remote M3U URL with multi-proxy fallback to bypass CORS and network restrictions.
 */
export async function fetchAndParseM3U(url: string): Promise<IPTVChannel[]> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('الرابط فارغ، يرجى إدخال رابط M3U صحيح.');
  }

  let lastError: Error | null = null;
  let parsedChannels: IPTVChannel[] = [];

  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxyFn = CORS_PROXIES[i];
    const targetUrl = proxyFn(cleanUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`استجابة غير صالحة من المصدر (${response.status})`);
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('الملف المسترجع فارغ');
      }

      parsedChannels = parseM3U(text);
      if (parsedChannels.length > 0) {
        return parsedChannels;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Fetch attempt ${i + 1} failed for ${targetUrl}:`, err.message);
    }
  }

  // If all proxies failed to extract channels
  if (parsedChannels.length === 0) {
    throw new Error(
      lastError?.message || 'تعذر تحميل أو قراءة محتوى الرابط. تأكد من صحة الرابط أو قم بلصق نص M3U مباشرة.'
    );
  }

  return parsedChannels;
}


