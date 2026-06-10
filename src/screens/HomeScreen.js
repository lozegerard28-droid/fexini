import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl } from '../utils/storage';

const CATS = [
  { key: 'films', label: 'Films' },
  { key: 'series', label: 'Séries' },
  { key: 'animes', label: 'Animés' },
];

export default function Home({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [url, setUrl] = useState(null);
  const [sr, setSr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getMainDomain();
        if (saved) { setUrl(saved); setItems(await F.fetchHomepage(saved)); }
        else { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); setItems(await F.fetchHomepage(d)); }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const doSearch = useCallback(async (query) => {
    if (!query.trim() || !url) { setSr(null); return; }
    setSr(await F.searchContent(url, query.trim()));
  }, [url]);

  if (loading) return (
    <View style={s.c}><View style={s.ctr}><Image source={require('../../assets/icon.png')} style={s.logo} /><ActivityIndicator size="large" color="#e94560" /><Text style={s.lt}>Connexion...</Text></View></View>
  );

  return (
    <View style={s.c}>
      <View style={s.h}>
        <Text style={s.ht}>FLEXINI</Text>
        {url ? <Text style={s.on}>{url.replace('https://', '')}</Text> : <Text style={s.off}>Indisponible</Text>}
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}><Text style={{ color: '#fff', fontSize: 20 }}>⚙</Text></TouchableOpacity>
      </View>

      <View style={s.sr}>
        <TextInput style={s.si} placeholder="Rechercher..." placeholderTextColor="#8892b0" value={q}
          onChangeText={setQ} returnKeyType="search" onSubmitEditing={() => doSearch(q)} />
        <TouchableOpacity style={s.sbtn} onPress={() => doSearch(q)}><Text style={{ color: '#fff' }}>OK</Text></TouchableOpacity>
      </View>

      <View style={s.cr}>
        {CATS.map(c => (
          <TouchableOpacity key={c.key} style={s.cb} onPress={() => navigation.navigate('Category', { category: c.key, label: c.label, url })}>
            <Text style={s.cl}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sr || items}
        keyExtractor={i => i.slug}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.it} onPress={() => navigation.navigate('Detail', { slug: item.slug, url })}>
            <Text style={s.itT}>{item.title}</Text>
            {item.year ? <Text style={s.itY}>{item.year}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
      />
    </View>
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
  sr: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  si: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10, paddingHorizontal: 12, height: 40, color: '#fff' },
  sbtn: { backgroundColor: '#e94560', borderRadius: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  cr: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  cb: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cl: { color: '#fff', fontSize: 13, fontWeight: '600' },
  it: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  itT: { color: '#ccd6f6', fontSize: 14 },
  itY: { color: '#8892b0', fontSize: 11, marginTop: 2 },
});
