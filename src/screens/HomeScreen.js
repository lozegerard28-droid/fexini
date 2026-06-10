import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl } from '../utils/storage';
import ContentCard from '../components/ContentCard';

const CATS = [
  { key: 'films', label: 'Films' },
  { key: 'series', label: 'Séries' },
  { key: 'animes', label: 'Animés' },
];

export default function Home({ onNavigate, onSettings }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [url, setUrl] = useState(null);
  const [sr, setSr] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getMainDomain();
        if (saved) { setUrl(saved); setItems(await F.fetchHomepage(saved)); }
        else { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); setItems(await F.fetchHomepage(d)); }
      } catch (e) { setError(e.message); }
      setLoading(false);
    })();
  }, []);

  const doSearch = useCallback(async (query) => {
    if (!query.trim() || !url) { setSr(null); return; }
    setSr(await F.searchContent(url, query.trim()));
  }, [url]);

  if (loading) return (
    <SafeAreaView style={s.c}><View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /><Text style={{ color: '#8892b0', marginTop: 16 }}>Connexion...</Text></View></SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={s.c}><View style={s.ctr}><Text style={{ color: '#e94560', fontSize: 14 }}>{error}</Text></View></SafeAreaView>
  );

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <Text style={s.ht}>FLEXINI</Text>
        {url ? <Text style={s.on}>{url.replace('https://', '')}</Text> : <Text style={s.off}>Indisponible</Text>}
        <TouchableOpacity onPress={() => onSettings && onSettings(url)} style={s.gear}>
          <Text style={{ color: '#8892b0', fontSize: 20 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={s.sr}>
        <TextInput style={s.si} placeholder="Rechercher..." placeholderTextColor="#8892b0" value={q}
          onChangeText={setQ} returnKeyType="search" onSubmitEditing={() => doSearch(q)} />
        <TouchableOpacity style={s.sbtn} onPress={() => doSearch(q)}><Text style={{ color: '#fff', fontSize: 16 }}>OK</Text></TouchableOpacity>
      </View>

      <View style={s.cr}>
        {CATS.map(c => (
          <TouchableOpacity key={c.key} style={s.cb} onPress={() => onNavigate('category', { category: c.key, label: c.label, url })}>
            <Text style={s.cl}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sr || items}
        keyExtractor={i => i.slug}
        numColumns={2}
        columnWrapperStyle={s.rw}
        contentContainerStyle={s.lst}
        renderItem={({ item }) => (
          <ContentCard item={item} onPress={() => onNavigate('detail', { slug: item.slug, url, category: 'home', label: 'Accueil' })} />
        )}
        ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  ht: { color: '#e94560', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  on: { color: '#4ade80', fontSize: 10 },
  off: { color: '#e94560', fontSize: 10 },
  gear: { paddingHorizontal: 8, paddingVertical: 4 },
  sr: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  si: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', fontSize: 15 },
  sbtn: { backgroundColor: '#e94560', borderRadius: 10, width: 48, height: 44, justifyContent: 'center', alignItems: 'center' },
  cr: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  cb: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cl: { color: '#fff', fontSize: 14, fontWeight: '600' },
  lst: { padding: 12, paddingBottom: 20 },
  rw: { justifyContent: 'space-between' },
});
