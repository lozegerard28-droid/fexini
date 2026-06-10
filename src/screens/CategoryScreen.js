import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import * as F from '../services/FexiniService';
import ContentCard from '../components/ContentCard';

export default function Category({ category, label, url, onBack, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setItems(await F.fetchCategory(url, category)); setLoading(false); })(); }, []);

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backT}>← Retour</Text></TouchableOpacity>
        <Text style={s.t}>{label}</Text>
        <View style={{ width: 60 }} />
      </View>
      {loading ? <View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View>
      : <FlatList data={items} keyExtractor={(i, idx) => `${i.slug}-${idx}`} numColumns={2} columnWrapperStyle={s.rw} contentContainerStyle={s.lst}
          renderItem={({ item }) => (
            <ContentCard item={item} onPress={() => onNavigate('detail', { slug: item.slug, url, category, label })} />
          )}
          ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
        />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  back: { paddingHorizontal: 8, paddingVertical: 8 },
  backT: { color: '#e94560', fontSize: 16 },
  t: { color: '#fff', fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  lst: { padding: 12, paddingBottom: 20 },
  rw: { justifyContent: 'space-between' },
});
