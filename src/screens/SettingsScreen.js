import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as F from '../services/FexiniService';
import { clearHistory, getDiscoveryUrl, setDiscoveryUrl, setMainDomain } from '../utils/storage';

export default function Settings({ route, navigation }) {
  const { url, onRefresh } = route.params;
  const [du, setDu] = useState('');
  const [mu, setMu] = useState('');
  const [disc, setDisc] = useState(false);

  useEffect(() => { (async () => { setDu(await getDiscoveryUrl()); setMu(url || ''); })(); }, []);

  const doDisc = async () => {
    setDisc(true);
    try { const d = await F.discoverMainDomain(du); await setMainDomain(d); if (onRefresh) onRefresh(); Alert.alert('OK', d); } catch (e) { Alert.alert('Échec', e.message); }
    setDisc(false);
  };

  const doManual = async () => {
    const m = mu.trim().replace(/\/+$/, '');
    if (!m.startsWith('http')) { Alert.alert('Erreur', 'URL invalide'); return; }
    try { const r = await fetch(m + '/', { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (!r.ok) Alert.alert('Attention', `Code ${r.status}`); } catch { Alert.alert('Erreur', 'Impossible de joindre'); return; }
    await setMainDomain(m); if (onRefresh) onRefresh(); Alert.alert('OK', `Serveur: ${m}`);
  };

  const doClearHistory = async () => {
    await clearHistory();
    if (onRefresh) onRefresh();
    Alert.alert('OK', 'Historique effacé');
  };

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}><Text style={s.htf}>FLEXINI</Text></TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={s.st}>Serveur</Text>
        <View style={s.it}><Ionicons name="globe" size={22} color={url ? '#4ade80' : '#e94560'} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={s.lb}>Serveur actuel</Text><Text style={[s.vl, { color: url ? '#4ade80' : '#e94560' }]}>{url || 'Indisponible'}</Text></View></View>
        <TouchableOpacity style={s.it} onPress={doDisc} disabled={disc}>{disc ? <ActivityIndicator size="small" color="#e94560" /> : <Ionicons name="search" size={22} color="#e94560" />}<View style={{ flex: 1, marginLeft: 12 }}><Text style={s.lb}>Détection auto</Text><Text style={s.vl}>Scanne les URLs</Text></View><Ionicons name="chevron-forward" size={20} color="#8892b0" /></TouchableOpacity>
        <TextInput style={s.inp} value={du} onChangeText={async (t) => { setDu(t); await setDiscoveryUrl(t); }} placeholder="https://fexini.net/" placeholderTextColor="#4a5568" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={[s.inp, { marginTop: 8 }]} value={mu} onChangeText={setMu} placeholder="https://fexini.net" placeholderTextColor="#4a5568" autoCapitalize="none" autoCorrect={false} onSubmitEditing={doManual} />
        <TouchableOpacity style={s.btn} onPress={doManual}><Text style={s.btxt}>Valider le serveur manuel</Text></TouchableOpacity>

        <Text style={[s.st, { marginTop: 32 }]}>Historique</Text>
        <TouchableOpacity style={s.it} onPress={doClearHistory}><Ionicons name="trash" size={22} color="#e94560" /><View style={{ flex: 1, marginLeft: 12 }}><Text style={s.lb}>Effacer l'historique</Text><Text style={s.vl}>Supprime tous les titres visionnés</Text></View><Ionicons name="chevron-forward" size={20} color="#8892b0" /></TouchableOpacity>

        <View style={{ marginTop: 40, alignItems: 'center' }}><Text style={{ color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}>Flexini Mobile</Text><Text style={{ color: '#8892b0', fontSize: 12, marginTop: 4 }}>v1.0.0</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  htf: { color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  st: { color: '#8892b0', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  it: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  lb: { color: '#fff', fontSize: 14, fontWeight: '500' },
  vl: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  inp: { backgroundColor: '#0a0a1a', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#0f3460' },
  btn: { backgroundColor: '#e94560', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  btxt: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
