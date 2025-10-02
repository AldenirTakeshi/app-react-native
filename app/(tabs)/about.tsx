import { StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre este app</Text>
      <Text style={styles.text}>Este é um exemplo de navegação com Expo Router.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  text: { fontSize: 16, color: "#aaa" }
});
