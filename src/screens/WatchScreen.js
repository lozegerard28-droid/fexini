import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Linking, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as F from '../services/FexiniService';
import { addToHistory, getPosition, setPosition } from '../utils/storage';

const SAVE_INTERVAL = 10000;

export default function Watch({ route, navigation }) {
  const { watchSlug, url, detail } = route.params;
  const [src, setSrc] = useState([]);
  const [ld, setLd] = useState(true);
  const [idx, setIdx] = useState(0);
  const [resumed, setResumed] = useState(false);
  const wvRef = useRef(null);
  const posRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (detail) await addToHistory({ slug: watchSlug, title: detail.title, poster: detail.poster, year: detail.year });
      const d = await F.fetchWatchPage(url, watchSlug);
      setSrc(d.sources);
      setLd(false);
    })();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const savePos = useCallback(async () => {
    if (posRef.current > 5) await setPosition(watchSlug, posRef.current);
  }, [watchSlug]);

  const startTracking = useCallback(() => {
    timerRef.current = setInterval(async () => {
      try {
        if (wvRef.current) {
          wvRef.current.injectJavaScript(`
            (function() {
              const v = document.querySelector('video');
              if (v) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'pos', t: v.currentTime})); }
            })();
          `);
        }
        if (posRef.current > 5) await setPosition(watchSlug, posRef.current);
      } catch {}
    }, SAVE_INTERVAL);
  }, [watchSlug]);

  useEffect(() => {
    if (!ld && src.length > 0) {
      const s = src[idx];
      if (s.type === 'iframe' || s.type === 'page') {
        (async () => {
          const saved = await getPosition(watchSlug);
          if (saved && saved > 5) {
            Alert.alert('Reprendre', `Lecture à ${Math.floor(saved / 60)}:${String(Math.floor(saved % 60)).padStart(2, '0')} ?`, [
              { text: 'Recommencer', style: 'cancel' },
              { text: 'Reprendre', onPress: () => { setResumed(true); startTracking(); } },
            ]);
          } else { startTracking(); }
        })();
      } else { startTracking(); }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ld, idx]);

  navigation.addListener('beforeRemove', savePos);

  const onMessage = useCallback((e) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d.type === 'pos' && typeof d.t === 'number') posRef.current = d.t;
    } catch {}
  }, []);

  if (ld) return <SafeAreaView style={s.c}><View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /></View></SafeAreaView>;

  const source = src[idx];

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={() => { savePos(); navigation.goBack(); }}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}><Text style={s.htf}>FLEXINI</Text></TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {source ? (
          source.type === 'iframe' || source.type === 'video' || source.type === 'page' || source.type === 'player' ? (
            <WebView ref={wvRef} source={{ uri: source.url }} style={s.wv} javaScriptEnabled domStorageEnabled allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} allowsInlineMediaPlayback onMessage={onMessage} />
          ) : (
            <View style={s.ctr}>
              <Ionicons name="videocam" size={48} color="#8892b0" />
              <Text style={{ color: '#8892b0', marginTop: 12, textAlign: 'center', padding: 20 }}>{source.url}</Text>
              <TouchableOpacity style={s.ob} onPress={() => Linking.openURL(source.url)}><Ionicons name="open-outline" size={18} color="#fff" /><Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Ouvrir</Text></TouchableOpacity>
            </View>
          )
        ) : <View style={s.ctr}><Text style={{ color: '#8892b0' }}>Aucune source</Text></View>}
        {src.length > 1 ? <View style={{ padding: 16 }}><Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>Sources</Text>
          {src.map((s, i) => <TouchableOpacity key={i} style={[s.si, idx === i && s.sa]} onPress={() => setIdx(i)}>
            <Ionicons name={s.type === 'direct' ? 'link' : 'videocam'} size={16} color={idx === i ? '#e94560' : '#8892b0'} />
            <Text style={{ color: idx === i ? '#e94560' : '#8892b0', fontSize: 12, fontWeight: '600' }}>{s.type.toUpperCase()}</Text>
          </TouchableOpacity>)}
        </View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  htf: { color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  wv: { width: '100%', height: 300, backgroundColor: '#000' },
  ob: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f3460', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginTop: 16 },
  si: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, gap: 8 },
  sa: { borderWidth: 1, borderColor: '#e94560' },
});
