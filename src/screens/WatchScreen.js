import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { addToHistory } from '../utils/storage';

export default function Watch({ watchUrl, slug, title, poster, type, year, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backT}>← Retour</Text></TouchableOpacity>
        <Text style={s.t} numberOfLines={1}>Lecture</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={s.ct}>
        {error ? (
          <View style={s.ctr}>
            <Text style={{ color: '#e94560', marginBottom: 12 }}>{error}</Text>
            <TouchableOpacity style={s.retry} onPress={() => setError(null)}>
              <Text style={{ color: '#fff' }}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {loading && <View style={s.ctr}><ActivityIndicator size="large" color="#e94560" /><Text style={{ color: '#8892b0', marginTop: 10 }}>Chargement...</Text></View>}
            <WebView
              source={{ uri: watchUrl }}
              style={s.web}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              onLoad={() => {
                setLoading(false);
                if (!added && slug) {
                  setAdded(true);
                  addToHistory({ slug, title, poster, type, year });
                }
              }}
              onError={() => { setLoading(false); setError('Erreur de chargement'); }}
            />
          </>
        )}
      </View>
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
  ct: { flex: 1 },
  web: { flex: 1, backgroundColor: '#0a0a1a' },
  retry: { backgroundColor: '#e94560', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
});
