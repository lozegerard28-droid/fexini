import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [url, setUrl] = useState(null);
  const [sr, setSr] = useState(null);
  const [history, setHistory] = useState([]);
  const [histPos, setHistPos] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <View style={s.c}>
      <View style={s.ctr}>
        <Image source={require('../../assets/icon.png')} style={s.logo} />
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={s.lt}>Connexion...</Text>
      </View>
    </View>
  );

  return (
    <View style={s.c}>
      <View style={s.ctr}>
        <Text style={{ color: '#fff', fontSize: 20 }}>HOOKS OK ({items.length})</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a1a' },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20, tintColor: '#e94560' },
  lt: { color: '#8892b0', marginTop: 16, fontSize: 14 },
});
