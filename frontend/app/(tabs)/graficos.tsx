import { StyleSheet, Text, View } from 'react-native';

export default function GraficosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gráficos</Text>
      <Text style={styles.subtitle}>Visualize seus gastos em gráficos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
});
