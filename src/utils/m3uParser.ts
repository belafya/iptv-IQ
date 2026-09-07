import { IPTVChannel } from '../types';
import { CURATED_IPTV_CHANNELS, DEFAULT_ARABIC_M3U_URL } from '../data/curatedChannels';

export { DEFAULT_ARABIC_M3U_URL };

export function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split(/\r?\n/);
  const channels: IPTVChannel[] = [];
  let currentInfo: Partial<IPTVChannel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentInfo = {};
      
      // Parse tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      if (logoMatch) currentInfo.logo = logoMatch[1];

      // Parse group-title
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      currentInfo.group = groupMatch ? groupMatch[1] : 'عام';

      // Parse tvg-country
      const countryMatch = line.match(/tvg-country="([^"]+)"/i);
      if (countryMatch) currentInfo.country = countryMatch[1];

      // Parse channel name (comes after the last comma)
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentInfo.name = line.substring(commaIndex + 1).trim();
      } else {
        currentInfo.name = 'قناة غير معنونة';
      }
    } else if (!line.startsWith('#') && currentInfo) {
      if (line.startsWith('http://') || line.startsWith('https://')) {
        channels.push({
          id: `ch-${channels.length + 1}-${Math.random().toString(36).substring(2, 8)}`,
          name: currentInfo.name || `قناة ${channels.length + 1}`,
          logo: currentInfo.logo,
          group: currentInfo.group || 'عام',
          country: currentInfo.country,
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

export async function fetchAndParseM3U(url: string): Promise<IPTVChannel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`تعذر تحميل قائمة القنوات: ${response.statusText}`);
    }
    const text = await response.text();
    const channels = parseM3U(text);
    if (channels.length === 0) {
      return CURATED_IPTV_CHANNELS;
    }
    return channels;
  } catch (err) {
    console.warn('CORS or network error fetching remote M3U, using fallback:', err);
    return CURATED_IPTV_CHANNELS;
  }
}

