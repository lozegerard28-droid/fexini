import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';
import * as F from '../services/FexiniService';

export default function Category({ route, navigation }) {
  const { category, label, url } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setItems(await F.fetchCategory(url, category)); setLoading(false); })(); }, []);

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}><Text style={s.htf}>FLEXINI</Text></TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      {loading ? <View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View>
      : <FlatList data={items} keyExtractor={(i, idx) => `${i.slug}-${idx}`} numColumns={2} columnWrapperStyle={s.rw} renderItem={({ item }) => <ContentCard item={item} onPress={() => navigation.navigate('Detail', { slug: item.slug, url })} />} contentContainerStyle={s.lst}
          ListEmptyComponent={<View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucun contenu</Text></View>}
        />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  htf: { color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  t: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  lst: { padding: 8, paddingBottom: 20 },
  rw: { justifyContent: 'space-between', paddingHorizontal: 8 },
});
