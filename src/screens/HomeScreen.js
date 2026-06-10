import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView } from 'react-native';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl, getHistory } from '../utils/storage';
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
  const [history, setHistory] = useState([]);

  const load = useCallback(async (u) => {
    setItems(await F.fetchHomepage(u));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getMainDomain();
        if (saved) { setUrl(saved); await load(saved); }
        else { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); await load(d); }
      } catch (e) { setError(e.message); }
      const h = await getHistory();
      setHistory(h.slice(0, 10));
      setLoading(false);
    })();
  }, []);

  const doSearch = useCallback(async (query) => {
    if (!query.trim() || !url) { setSr(null); return; }
    setSr(await F.searchContent(url, query.trim()));
  }, [url]);

  const renderHeader = () => (
    <View>
      {history.length > 0 ? (
        <View style={s.hsec}>
          <Text style={s.hst}>Reprendre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hsc}>
            {history.map(item => (
              <View key={item.slug} style={s.hcw}>
                <ContentCard item={item} onPress={() => onNavigate('detail', { slug: item.slug, url, category: 'home', label: 'Accueil' })} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}
      <View style={s.cr}>
        {CATS.map(c => (
          <TouchableOpacity key={c.key} style={s.cb} onPress={() => onNavigate('category', { category: c.key, label: c.label, url })}>
            <Text style={s.cl}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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

      <FlatList
        data={sr || items}
        keyExtractor={i => i.slug}
        numColumns={2}
        columnWrapperStyle={s.rw}
        contentContainerStyle={s.lst}
        ListHeaderComponent={renderHeader}
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
  hsec: { marginBottom: 12 },
  hst: { color: '#8892b0', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 16 },
  hsc: { paddingHorizontal: 12 },
  hcw: { width: 150, marginHorizontal: 4 },
  cr: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  cb: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cl: { color: '#fff', fontSize: 14, fontWeight: '600' },
  lst: { padding: 12, paddingBottom: 20 },
  rw: { justifyContent: 'space-between' },
});
