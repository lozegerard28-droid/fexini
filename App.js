import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Home from './src/screens/HomeScreen';
import Category from './src/screens/CategoryScreen';
import Detail from './src/screens/DetailScreen';
import Watch from './src/screens/WatchScreen';
import Settings from './src/screens/SettingsScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState({});
  const [key, setKey] = useState(0);

  const go = useCallback((name, p) => { setScreen(name); setParams(p || {}); }, []);

  const backFromDetail = () => {
    go('category', { category: params.category, label: params.label, url: params.url });
  };

  const backFromWatch = () => {
    go('detail', { slug: params.slug, url: params.url, category: params.category, label: params.label, title: params.title });
  };

  const handleRefresh = () => {
    setKey(k => k + 1);
    go('home');
  };

  const handleSettings = (currentUrl) => {
    go('settings', { url: currentUrl });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {screen === 'home' && <Home key={key} onNavigate={go} onSettings={handleSettings} />}
      {screen === 'category' && <Category {...params} onBack={() => go('home')} onNavigate={go} />}
      {screen === 'detail' && <Detail {...params} onBack={backFromDetail} onNavigate={go} />}
      {screen === 'watch' && <Watch {...params} onBack={backFromWatch} />}
      {screen === 'settings' && <Settings {...params} onBack={() => go('home')} onRefresh={handleRefresh} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },
});
