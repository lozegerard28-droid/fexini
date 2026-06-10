import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl, getHistory, getPosition } from '../utils/storage';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [url, setUrl] = useState(null);
  const [sr, setSr] = useState(null);
  const [history, setHistory] = useState([]);
  const [histPos, setHistPos] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    init();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const init = async () => {
    try {
      const saved = await getMainDomain();
      if (saved) { setUrl(saved); await load(saved); }
      else { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); await load(d); }
    } catch { setUrl(null); }
    await refreshHistory();
    setLoading(false);
  };

  const refreshHistory = async () => {
    const h = await getHistory();
    const top = h.slice(0, 5);
    setHistory(top);
    const pos = {};
    for (const item of top) {
      const p = await getPosition(item.slug);
      if (p && p > 5) pos[item.slug] = p;
    }
    setHistPos(pos);
  };

  const load = async (u) => setItems(await F.fetchHomepage(u));

  const onRefresh = useCallback(async () => {
    if (!url) return;
    setRefreshing(true);
    await load(url);
    await refreshHistory();
    setRefreshing(false);
  }, [url]);

  if (loading) return (
    <View style={s.c}>
      <View style={s.ctr}>
        <Image source={require('../../assets/icon.png')} style={s.logo} />
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={s.lt}>Connexion...</Text>
      </View>
    </View>
  );

  return (
    <View style={s.c}>
      <View style={s.ctr}>
        <Text style={{ color: '#fff', fontSize: 20 }}>
          API OK ({items.length} items, {history.length} hist)
        </Text>
        {url ? <Text style={{ color: '#4ade80', fontSize: 12, marginTop: 8 }}>{url}</Text>
              : <Text style={{ color: '#e94560', fontSize: 12, marginTop: 8 }}>Pas de connexion</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20, tintColor: '#e94560' },
  lt: { color: '#8892b0', marginTop: 16, fontSize: 14 },
});
