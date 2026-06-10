import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl, getHistory, getPosition } from '../utils/storage';

export default function Home({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const doInit = async () => {
      try {
        const saved = await getMainDomain();
        if (saved) { setUrl(saved); setItems(await F.fetchHomepage(saved)); }
        else { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); setItems(await F.fetchHomepage(d)); }
      } catch {}
      setLoading(false);
    };
    doInit();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  if (loading) return (
    <View style={s.c}><View style={s.ctr}><Image source={require('../../assets/icon.png')} style={s.logo} /><ActivityIndicator size="large" color="#e94560" /><Text style={s.lt}>Connexion...</Text></View></View>
  );

  return (
    <View style={s.c}>
      <Text style={s.ht}>FLEXINI ({items.length})</Text>
      <FlatList
        data={items}
        keyExtractor={i => i.slug}
        renderItem={({ item, index }) => (
          <View style={s.item}>
            <Text style={s.idx}>{index + 1}</Text>
            <Text style={s.title}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20, tintColor: '#e94560' },
  lt: { color: '#8892b0', marginTop: 16, fontSize: 14 },
  ht: { color: '#e94560', fontSize: 22, fontWeight: 'bold', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  item: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  idx: { color: '#4a5568', fontSize: 12, marginRight: 8, width: 24 },
  title: { color: '#ccd6f6', fontSize: 14 },
});
