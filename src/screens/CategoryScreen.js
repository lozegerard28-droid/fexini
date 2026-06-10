import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import * as F from '../services/FexiniService';

export default function Category({ category, label, url, onBack, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setItems(await F.fetchCategory(url, category)); setLoading(false); })(); }, []);

  return (
    <View style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: '#e94560', fontSize: 18 }}>←</Text></TouchableOpacity>
        <Text style={s.t}>{label}</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? <View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View>
      : <FlatList data={items} keyExtractor={(i, idx) => `${i.slug}-${idx}`} numColumns={2} columnWrapperStyle={s.rw}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => onNavigate('detail', { slug: item.slug, url, category, label })}>
              <Text style={{ color: '#ccd6f6', fontSize: 12 }}>{item.title}</Text>
              {item.year ? <Text style={{ color: '#8892b0', fontSize: 10 }}>{item.year}</Text> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
        />}
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  t: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  rw: { justifyContent: 'space-between', paddingHorizontal: 8 },
  card: { width: '48%', backgroundColor: '#1a1a2e', borderRadius: 8, padding: 10, marginBottom: 10 },
});
