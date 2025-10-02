import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
      }}
    >
      <Text style={{ fontSize: 24, color: "white" }}>
        🚀 Teste de atualização
      </Text>
    </View>
  );
}
