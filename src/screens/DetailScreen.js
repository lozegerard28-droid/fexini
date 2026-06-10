import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import * as F from '../services/FexiniService';

const { width } = Dimensions.get('window');

export default function Detail({ slug, url, category, label, onBack, onNavigate }) {
  const [d, setD] = useState(null);
  const [ld, setLd] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await F.fetchContentDetail(url, slug);
      setD(data);
      setLd(false);
    })();
  }, []);

  const handlePlay = async () => {
    if (!d) return;
    setPlaying(true);
    try {
      const watch = await F.fetchWatchPage(url, slug);
      if (watch.sources.length > 0) {
        const src = watch.sources[0];
        const targetUrl = src.url.startsWith('http') ? src.url : url + src.url;
        onNavigate('watch', { watchUrl: targetUrl, slug, url, category, label, title: d.title, poster: d.poster, type: d.type, year: d.year });
      }
    } catch {}
    setPlaying(false);
  };

  if (ld) return (
    <SafeAreaView style={s.c}><View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View></SafeAreaView>
  );

  if (!d) return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backT}>← Retour</Text></TouchableOpacity>
        <Text style={s.t}>Erreur</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={s.ctr}><Text style={{ color: '#8892b0' }}>Impossible de charger</Text></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backT}>← Retour</Text></TouchableOpacity>
        <Text style={s.htf} numberOfLines={1}>FLEXINI</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {d.poster ? (
          <Image source={{ uri: d.poster }} style={s.p} resizeMode="cover" />
        ) : (
          <View style={[s.p, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#4a5568', fontSize: 14 }}>Pas d'affiche</Text>
          </View>
        )}
        <View style={s.i}>
          <Text style={s.title}>{d.title}</Text>
          <View style={s.mr}>
            {d.year ? <Text style={s.m}>{d.year}</Text> : null}
            {d.type ? <View style={s.b}><Text style={s.bt}>{d.type}</Text></View> : null}
            {d.rating ? <Text style={s.r}>★ {d.rating}</Text> : null}
          </View>
          {d.description ? <Text style={s.ds}>{d.description}</Text> : null}
          <TouchableOpacity style={s.wb} onPress={handlePlay} disabled={playing}>
            <Text style={s.wbT}>{playing ? 'Chargement...' : '▶  Regarder'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  htf: { color: '#e94560', fontSize: 17, fontWeight: 'bold', letterSpacing: 2, flex: 1, textAlign: 'center' },
  p: { width, height: width * 0.56, backgroundColor: '#16213e' },
  i: { padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  mr: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  m: { color: '#8892b0', fontSize: 13 },
  b: { backgroundColor: '#0f3460', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  bt: { color: '#e94560', fontSize: 11, fontWeight: '600' },
  r: { color: '#f5c518', fontSize: 13, fontWeight: '600' },
  ds: { color: '#a8b2d1', fontSize: 14, lineHeight: 22, marginTop: 12 },
  wb: { backgroundColor: '#e94560', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  wbT: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
