import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';
import * as F from '../services/FexiniService';
import { getMainDomain, setMainDomain, getDiscoveryUrl, getHistory, getPosition } from '../utils/storage';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a1a' }}>
      <Text style={{ color: '#fff', fontSize: 24 }}>IMPORTS OK</Text>
    </View>
  );
}
