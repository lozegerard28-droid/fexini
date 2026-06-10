import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';

export default function Home() {
  return (
    <View style={s.c}>
      <View style={s.ctr}>
        <Image source={require('../../assets/icon.png')} style={s.logo} />
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={s.lt}>Connexion...</Text>
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
