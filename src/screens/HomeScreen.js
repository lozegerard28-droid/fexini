import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Image } from 'react-native';
import ContentCard from '../components/ContentCard';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl, getHistory, getPosition } from '../utils/storage';

export default function Home({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [url, setUrl] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => { init(); return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, []);

  const init = async () => {
    try {
      const saved = await getMainDomain();
      if (saved) { setUrl(saved); await load(saved); }
      else { const disc = await getDiscoveryUrl(); const d = await F.discoverMainDomain(disc); await setMainDomain(d); setUrl(d); await load(d); }
    } catch { setUrl(null); }
    setLoading(false);
  };

  const load = async (u) => setItems(await F.fetchHomepage(u));
  const onRefresh = useCallback(async () => { if (!url) return; setRefreshing(true); await load(url); setRefreshing(false); }, [url]);

  if (loading) return (
    <View style={s.c}><View style={s.ctr}><Image source={require('../../assets/icon.png')} style={s.logo} /><ActivityIndicator size="large" color="#e94560" /><Text style={s.lt}>Connexion...</Text></View></View>
  );

  return (
    <View style={s.c}>
      <View style={s.h}>
        <Text style={s.ht}>FLEXINI ({items.length})</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={i => i.slug}
        renderItem={({ item }) => <ContentCard item={item} onPress={() => navigation.navigate('Detail', { slug: item.slug, url })} />}
        contentContainerStyle={s.lst}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20, tintColor: '#e94560' },
  lt: { color: '#8892b0', marginTop: 16, fontSize: 14 },
  h: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  ht: { color: '#e94560', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  lst: { padding: 8, paddingBottom: 20 },
});
