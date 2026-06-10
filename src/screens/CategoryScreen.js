import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import * as F from '../services/FexiniService';

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
      : <FlatList data={items} keyExtractor={(i, idx) => `${i.slug}-${idx}`} numColumns={2} columnWrapperStyle={s.rw}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => onNavigate('detail', { slug: item.slug, url, category, label })}>
              <Text style={s.cardT} numberOfLines={2}>{item.title}</Text>
              {item.year ? <Text style={s.cardY}>{item.year}</Text> : null}
              {item.type ? <View style={s.cardB}><Text style={s.cardBt}>{item.type}</Text></View> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
          contentContainerStyle={s.lst}
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
  lst: { padding: 8, paddingBottom: 20 },
  rw: { justifyContent: 'space-between', paddingHorizontal: 4 },
  card: { width: '48%', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a4e' },
  cardT: { color: '#ccd6f6', fontSize: 13, fontWeight: '500' },
  cardY: { color: '#8892b0', fontSize: 11, marginTop: 4 },
  cardB: { backgroundColor: '#0f3460', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 6 },
  cardBt: { color: '#e94560', fontSize: 10, fontWeight: '600' },
});
