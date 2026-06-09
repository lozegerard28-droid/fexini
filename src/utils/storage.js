import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MAIN_DOMAIN: '@fexini_main_domain',
  DISCOVERY_URL: '@fexini_discovery_url',
  DOWNLOAD_PATH: '@fexini_download_path',
  DOWNLOADS: '@fexini_downloads',
  HISTORY: '@fexini_history',
  POSITION_PREFIX: '@fexini_pos_',
};
const DEFAULT_DISCOVERY = 'https://fexini.net/';

export async function getMainDomain() { try { return await AsyncStorage.getItem(KEYS.MAIN_DOMAIN); } catch { return null; } }
export async function setMainDomain(d) { try { await AsyncStorage.setItem(KEYS.MAIN_DOMAIN, d); } catch {} }
export async function getDiscoveryUrl() { try { const u = await AsyncStorage.getItem(KEYS.DISCOVERY_URL); return u || DEFAULT_DISCOVERY; } catch { return DEFAULT_DISCOVERY; } }
export async function setDiscoveryUrl(u) { try { await AsyncStorage.setItem(KEYS.DISCOVERY_URL, u); } catch {} }
export async function getDownloadPath() { try { return await AsyncStorage.getItem(KEYS.DOWNLOAD_PATH); } catch { return null; } }
export async function setDownloadPath(p) { try { await AsyncStorage.setItem(KEYS.DOWNLOAD_PATH, p); } catch {} }
export async function getDownloads() { try { const d = await AsyncStorage.getItem(KEYS.DOWNLOADS); return d ? JSON.parse(d) : []; } catch { return []; } }

export async function addDownload(dl) {
  try {
    const d = await getDownloads();
    d.unshift({ ...dl, id: Date.now().toString(), date: new Date().toISOString() });
    await AsyncStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(d));
  } catch {}
}

export async function getHistory() {
  try { const h = await AsyncStorage.getItem(KEYS.HISTORY); return h ? JSON.parse(h) : []; } catch { return []; }
}

export async function addToHistory(item) {
  try {
    let h = await getHistory();
    h = h.filter(i => i.slug !== item.slug);
    h.unshift({ ...item, viewedAt: new Date().toISOString() });
    if (h.length > 100) h = h.slice(0, 100);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(h));
  } catch {}
}

export async function clearHistory() {
  try { await AsyncStorage.removeItem(KEYS.HISTORY); } catch {}
}

export async function getPosition(slug) {
  try { const v = await AsyncStorage.getItem(KEYS.POSITION_PREFIX + slug); return v ? parseFloat(v) : null; } catch { return null; }
}
export async function setPosition(slug, time) {
  try { await AsyncStorage.setItem(KEYS.POSITION_PREFIX + slug, String(time)); } catch {}
}
