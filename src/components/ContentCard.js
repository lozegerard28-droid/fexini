import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function ContentCard({ item, onPress }) {
  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={s.poster} resizeMode="cover" />
      ) : (
        <View style={[s.poster, s.ph]}>
          <Text style={{ color: '#4a5568', fontSize: 11 }}>No poster</Text>
          {item.year ? <Text style={s.phY}>{item.year}</Text> : null}
        </View>
      )}
      <View style={s.info}>
        <Text style={s.title} numberOfLines={2}>{item.title}</Text>
        <View style={s.meta}>
          {item.year ? <Text style={s.year}>{item.year}</Text> : null}
          {item.rating ? <Text style={s.rating}>★ {item.rating}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { width: CARD_W, backgroundColor: '#1a1a2e', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  poster: { width: '100%', height: 160, backgroundColor: '#16213e' },
  ph: { justifyContent: 'center', alignItems: 'center' },
  phY: { color: '#4a5568', fontSize: 11, marginTop: 4 },
  info: { padding: 10 },
  title: { color: '#fff', fontSize: 13, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  year: { color: '#8892b0', fontSize: 11 },
  rating: { color: '#f5c518', fontSize: 11, fontWeight: '600' },
});
