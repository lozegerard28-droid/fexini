import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity, TextInput, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl, getHistory, getPosition } from '../utils/storage';

const CATS = [
  { key: 'films', label: 'Films', icon: 'film' },
  { key: 'series', label: 'Séries', icon: 'tv' },
  { key: 'animes', label: 'Animés', icon: 'flame' },
];

export default function Home({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [url, setUrl] = useState(null);
  const [sr, setSr] = useState(null);
  const [history, setHistory] = useState([]);
  const [histPos, setHistPos] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => { init(); return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, []);

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
  const onRefresh = useCallback(async () => { if (!url) return; setRefreshing(true); await load(url); await refreshHistory(); setRefreshing(false); }, [url]);

  const rediscover = async () => {
    setLoading(true);
    try { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); await load(d); await refreshHistory(); } catch { setUrl(null); }
    setLoading(false);
  };

  const doSearch = useCallback(async (query) => {
    if (!query.trim() || !url) { setSr(null); return; }
    setSr(await F.searchContent(url, query.trim()));
  }, [url]);

  const onChangeQ = (text) => {
    setQ(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(text), 300);
    } else {
      setSr(null);
    }
  };

  const clearSearch = () => {
    setQ('');
    setSr(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  if (loading) return <SafeAreaView style={s.c}><View style={s.ctr}><Image source={require('../../assets/icon.png')} style={s.logo} /><ActivityIndicator size="large" color="#e94560" /><Text style={s.lt}>Connexion...</Text></View></SafeAreaView>;

  const ListHeader = (
    <View>
      {history.length > 0 && (
        <View>
          <View style={s.hrRow}>
            <Text style={s.st}>Reprendre</Text>
            <TouchableOpacity onPress={refreshHistory}>
              <Ionicons name="refresh" size={16} color="#8892b0" />
            </TouchableOpacity>
          </View>
          <FlatList horizontal showsHorizontalScrollIndicator={false} data={history} keyExtractor={i => i.slug} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }} renderItem={({ item }) => (
            <TouchableOpacity style={s.histCard} onPress={() => navigation.navigate('Detail', { slug: item.slug, url })}>
              <Image source={item.poster ? { uri: item.poster } : null} style={s.histImg} resizeMode="cover" />
              {histPos[item.slug] ? <View style={s.posBadge}><Text style={s.posText}>{formatTime(histPos[item.slug])}</Text></View> : null}
              <Text style={s.histTitle} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          )} />
        </View>
      )}
      <View style={s.cr}>{CATS.map(c => <TouchableOpacity key={c.key} style={s.cb} onPress={() => navigation.navigate('Category', { category: c.key, label: c.label, url })}><Ionicons name={c.icon} size={20} color="#e94560" /><Text style={s.cl}>{c.label}</Text></TouchableOpacity>)}</View>
      <Text style={s.st}>Derniers ajouts</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <View>
          <Text style={s.ht}>FLEXINI</Text>
          {url ? <Text style={s.on}>✓ {url.replace('https://', '')}</Text> : <Text style={s.off}>✗ Indisponible</Text>}
        </View>
        <View style={s.hr}>
          {!url ? <TouchableOpacity onPress={rediscover} style={s.rc}><Ionicons name="refresh" size={18} color="#fff" /></TouchableOpacity> : null}
          <TouchableOpacity onPress={() => navigation.navigate('Settings', { url, onRefresh: rediscover })}><Ionicons name="settings-outline" size={24} color="#fff" /></TouchableOpacity>
        </View>
      </View>

      <View style={s.sr}>
        <View style={s.sb}>
          <Ionicons name="search" size={18} color="#8892b0" />
          <TextInput style={s.si} placeholder="Rechercher..." placeholderTextColor="#8892b0" value={q} onChangeText={onChangeQ} returnKeyType="search" onSubmitEditing={() => doSearch(q)} />
          {q ? <TouchableOpacity onPress={clearSearch}><Ionicons name="close-circle" size={18} color="#8892b0" /></TouchableOpacity> : null}
        </View>
        <TouchableOpacity style={s.sbtn} onPress={() => doSearch(q)}><Ionicons name="arrow-forward" size={20} color="#fff" /></TouchableOpacity>
      </View>

      {sr ? <FlatList data={sr} keyExtractor={i => i.slug} numColumns={2} columnWrapperStyle={s.rw} renderItem={({ item }) => <ContentCard item={item} onPress={() => navigation.navigate('Detail', { slug: item.slug, url })} />} contentContainerStyle={s.lst} ListHeaderComponent={<Text style={s.st}>Résultats ({sr.length})</Text>} />
      : <FlatList data={items} keyExtractor={i => i.slug} numColumns={2} columnWrapperStyle={s.rw} renderItem={({ item }) => <ContentCard item={item} onPress={() => navigation.navigate('Detail', { slug: item.slug, url })} />} contentContainerStyle={s.lst} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
        />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20, tintColor: '#e94560' },
  lt: { color: '#8892b0', marginTop: 16, fontSize: 14 },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  ht: { color: '#e94560', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  on: { color: '#4ade80', fontSize: 10 },
  off: { color: '#e94560', fontSize: 10 },
  hr: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rc: { backgroundColor: '#e94560', borderRadius: 6, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  sr: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  sb: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 10, paddingHorizontal: 12, height: 40 },
  si: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 8 },
  sbtn: { backgroundColor: '#e94560', borderRadius: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  st: { color: '#fff', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 12 },
  cr: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  cb: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', borderRadius: 10, paddingVertical: 12, gap: 6 },
  cl: { color: '#fff', fontSize: 13, fontWeight: '600' },
  lst: { padding: 8, paddingBottom: 20 },
  rw: { justifyContent: 'space-between', paddingHorizontal: 8 },
  histCard: { width: 100, marginRight: 10 },
  histImg: { width: 100, height: 140, borderRadius: 8, backgroundColor: '#16213e' },
  histTitle: { color: '#ccd6f6', fontSize: 11, marginTop: 4, textAlign: 'center' },
  posBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(233,69,96,0.9)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  posText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
});
