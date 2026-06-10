import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/HomeScreen';
import Category from './src/screens/CategoryScreen';
import Detail from './src/screens/DetailScreen';
import Watch from './src/screens/WatchScreen';
import Settings from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Erreur</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => this.setState({ error: null })}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a1a', padding: 20 },
  title: { color: '#e94560', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  message: { color: '#ccd6f6', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#e94560', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a1a' }, animation: 'slide_from_right' }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Category" component={Category} />
          <Stack.Screen name="Detail" component={Detail} />
          <Stack.Screen name="Watch" component={Watch} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
