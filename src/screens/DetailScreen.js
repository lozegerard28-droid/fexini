import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as F from '../services/FexiniService';

const { width } = Dimensions.get('window');

export default function Detail({ slug, url, category, label, onBack }) {
  const [d, setD] = useState(null);
  const [ld, setLd] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await F.fetchContentDetail(url, slug);
      setD(data);
      setLd(false);
    })();
  }, []);

  if (ld) return <View style={s.c}><View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View></View>;
  if (!d) return <View style={s.c}><View style={s.h}><TouchableOpacity onPress={onBack}><Text style={{ color: '#e94560', fontSize: 18 }}>←</Text></TouchableOpacity><Text style={s.t}>Erreur</Text><View style={{ width: 24 }} /></View><View style={s.ctr}><Text style={{ color: '#8892b0' }}>Impossible de charger</Text></View></View>;

  return (
    <View style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: '#e94560', fontSize: 18 }}>←</Text></TouchableOpacity>
        <Text style={s.htf}>FLEXINI</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView>
        {d.poster ? <Image source={{ uri: d.poster }} style={s.p} resizeMode="cover" /> : null}
        <View style={s.i}>
          <Text style={s.t}>{d.title}</Text>
          <View style={s.mr}>{d.year ? <Text style={s.m}>{d.year}</Text> : null}{d.type ? <View style={s.b}><Text style={s.bt}>{d.type}</Text></View> : null}{d.rating ? <Text style={s.r}>★ {d.rating}</Text> : null}</View>
          {d.description ? <Text style={s.ds}>{d.description}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  t: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  htf: { color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  p: { width, height: width * 0.56, backgroundColor: '#16213e' },
  i: { padding: 16 },
  mr: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  m: { color: '#8892b0', fontSize: 13 },
  b: { backgroundColor: '#0f3460', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  bt: { color: '#e94560', fontSize: 11, fontWeight: '600' },
  r: { color: '#f5c518', fontSize: 13, fontWeight: '600' },
  ds: { color: '#a8b2d1', fontSize: 14, lineHeight: 22, marginTop: 12 },
});
