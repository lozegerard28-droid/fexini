import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import * as F from '../services/FexiniService';
import { clearHistory, getDiscoveryUrl, setDiscoveryUrl, setMainDomain } from '../utils/storage';

export default function Settings({ url, onBack, onRefresh }) {
  const [du, setDu] = useState('');
  const [mu, setMu] = useState('');
  const [disc, setDisc] = useState(false);

  useEffect(() => {
    (async () => {
      setDu((await getDiscoveryUrl()) || '');
      setMu(url || '');
    })();
  }, []);

  const doAuto = async () => {
    setDisc(true);
    try {
      const d = await F.discoverMainDomain(du);
      await setMainDomain(d);
      if (onRefresh) onRefresh();
      Alert.alert('Trouvé', d);
    } catch (e) {
      Alert.alert('Échec', e.message || 'Aucun serveur trouvé');
    }
    setDisc(false);
  };

  const doManual = async () => {
    const m = mu.trim().replace(/\/+$/, '');
    if (!m.startsWith('http')) { Alert.alert('Erreur', 'URL invalide (doit commencer par http)'); return; }
    try {
      const r = await fetch(m + '/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) Alert.alert('Attention', `Code ${r.status}`);
    } catch {
      Alert.alert('Erreur', 'Impossible de joindre ce serveur');
      return;
    }
    await setMainDomain(m);
    if (onRefresh) onRefresh();
    Alert.alert('OK', `Serveur: ${m}`);
  };

  const doClearHistory = async () => {
    await clearHistory();
    if (onRefresh) onRefresh();
    Alert.alert('OK', 'Historique effacé');
  };

  return (
    <SafeAreaView style={s.c}>
      <View style={s.h}>
        <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backT}>← Retour</Text></TouchableOpacity>
        <Text style={s.htf}>FLEXINI</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={s.st}>Serveur</Text>

        <View style={s.it}>
          <View style={[s.dot, { backgroundColor: url ? '#4ade80' : '#e94560' }]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.lb}>Serveur actuel</Text>
            <Text style={[s.vl, { color: url ? '#4ade80' : '#e94560' }]}>{url || 'Indisponible'}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.it} onPress={doAuto} disabled={disc}>
          {disc ? <ActivityIndicator size="small" color="#e94560" /> : <Text style={{ fontSize: 18 }}>🔍</Text>}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.lb}>Détection auto</Text>
            <Text style={s.vl}>Scanne les URLs connues</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ color: '#8892b0', fontSize: 12, marginTop: 16, marginBottom: 8 }}>URL de découverte</Text>
        <TextInput style={s.inp} value={du} onChangeText={async (t) => { setDu(t); await setDiscoveryUrl(t); }}
          placeholder="https://fexini.net/" placeholderTextColor="#4a5568" autoCapitalize="none" autoCorrect={false} />

        <Text style={{ color: '#8892b0', fontSize: 12, marginTop: 16, marginBottom: 8 }}>URL manuelle</Text>
        <TextInput style={s.inp} value={mu} onChangeText={setMu}
          placeholder="https://fexini.net" placeholderTextColor="#4a5568" autoCapitalize="none" autoCorrect={false} onSubmitEditing={doManual} />
        <TouchableOpacity style={s.btn} onPress={doManual}>
          <Text style={s.btxt}>Valider le serveur manuel</Text>
        </TouchableOpacity>

        <Text style={[s.st, { marginTop: 32 }]}>Historique</Text>
        <TouchableOpacity style={s.it} onPress={doClearHistory}>
          <Text style={{ fontSize: 18 }}>🗑</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.lb}>Effacer l'historique</Text>
            <Text style={s.vl}>Supprime les titres visionnés</Text>
          </View>
        </TouchableOpacity>

        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Text style={{ color: '#e94560', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}>Flexini Mobile</Text>
          <Text style={{ color: '#8892b0', fontSize: 12, marginTop: 4 }}>v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  back: { paddingHorizontal: 8, paddingVertical: 8 },
  backT: { color: '#e94560', fontSize: 16 },
  htf: { color: '#e94560', fontSize: 17, fontWeight: 'bold', letterSpacing: 2 },
  st: { color: '#8892b0', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  it: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lb: { color: '#fff', fontSize: 14, fontWeight: '500' },
  vl: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  inp: { backgroundColor: '#0a0a1a', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#0f3460' },
  btn: { backgroundColor: '#e94560', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  btxt: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
