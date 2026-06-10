import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Home from './src/screens/HomeScreen';
import Category from './src/screens/CategoryScreen';
import Detail from './src/screens/DetailScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState({});

  const go = (name, p) => { setScreen(name); setParams(p || {}); };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {screen === 'home' && <Home onNavigate={go} />}
      {screen === 'category' && <Category {...params} onBack={() => go('home')} onNavigate={go} />}
      {screen === 'detail' && <Detail {...params} onBack={() => go('category', { category: params.category, label: params.label, url: params.url })} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },
});
