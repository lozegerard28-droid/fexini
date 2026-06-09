import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as F from '../services/FexiniService';

const { width } = Dimensions.get('window');

export default function Detail({ route, navigation }) {
  const { slug, url } = route.params;
  const [d, setD] = useState(null);
  const [ld, setLd] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await F.fetchContentDetail(url, slug);
      setD(data);
      setLd(false);
    })();
  }, []);

  if (ld) return <SafeAreaView style={s.c}><View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View></SafeAreaView>;
  if (!d) return <SafeAreaView style={s.c}><View style={s.h}><TouchableOpacity onPress={() => navigation.navigate('Home')}><Ionicons name="home" size={24} color="#e94560" /></TouchableOpacity><Text style={s.ht}>Erreur</Text><View style={{ width: 24 }} /></View><View style={s.ctr}><Text style={{ color: '#8892b0' }}>Impossible de charger</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}><Text style={s.htf}>FLEXINI</Text></TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView>
        {d.poster && <Image source={{ uri: d.poster }} style={s.p} resizeMode="cover" />}
        <View style={s.i}>
          <Text style={s.t}>{d.title}</Text>
          <View style={s.mr}>{d.year ? <Text style={s.m}>{d.year}</Text> : null}{d.type ? <View style={s.b}><Text style={s.bt}>{d.type}</Text></View> : null}{d.rating ? <Text style={s.r}>★ {d.rating}</Text> : null}</View>
          {d.description ? <Text style={s.ds}>{d.description}</Text> : null}
          <View style={s.ac}>
            <TouchableOpacity style={s.wb} onPress={() => navigation.navigate('Watch', { watchSlug: slug, url, detail: d })}><Ionicons name="play" size={18} color="#fff" /><Text style={s.btx}>Regarder</Text></TouchableOpacity>
          </View>
          {d.episodes?.length > 0 ? <View style={s.es}><Text style={s.st}>Épisodes</Text>
            {d.episodes.map((ep, i) => (
              <View key={i} style={s.er}><Text style={s.et} numberOfLines={1}>{ep.title}</Text>
                <View style={s.ea}>
                  <TouchableOpacity style={s.eb} onPress={() => navigation.navigate('Watch', { watchSlug: ep.slug, url, detail: d })}><Ionicons name="play" size={14} color="#fff" /></TouchableOpacity>
                </View>
              </View>
            ))}
          </View> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  ht: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  htf: { color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  p: { width, height: width * 0.56, backgroundColor: '#16213e' },
  i: { padding: 16 },
  t: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  mr: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  m: { color: '#8892b0', fontSize: 13 },
  b: { backgroundColor: '#0f3460', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  bt: { color: '#e94560', fontSize: 11, fontWeight: '600' },
  r: { color: '#f5c518', fontSize: 13, fontWeight: '600' },
  ds: { color: '#a8b2d1', fontSize: 14, lineHeight: 22, marginTop: 12 },
  ac: { flexDirection: 'row', gap: 12, marginTop: 20 },
  wb: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e94560', borderRadius: 10, paddingVertical: 14, gap: 8 },
  btx: { color: '#fff', fontSize: 14, fontWeight: '600' },
  es: { marginTop: 24 },
  st: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  er: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6 },
  et: { flex: 1, color: '#ccd6f6', fontSize: 13, textTransform: 'capitalize' },
  ea: { flexDirection: 'row', gap: 6 },
  eb: { backgroundColor: '#0f3460', borderRadius: 6, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
});
