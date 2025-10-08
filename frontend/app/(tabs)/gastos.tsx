import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GastoForm from "../../components/GastoForm";
import { Gasto } from "../../models/gasto";

export default function GastosScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const adicionarGasto = (novoGasto: Gasto) => {
    setGastos((prev) => [novoGasto, ...prev]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Gastos</Text>
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gastoItem}>
            <Text style={styles.gastoDescricao}>{item.descricao}</Text>
            <Text style={styles.gastoValor}>R$ {item.valor.toFixed(2)}</Text>
            <Text style={styles.gastoCategoria}>{item.categoria}</Text>
            <Text style={styles.gastoData}>{item.data}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum gasto cadastrado.</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <GastoForm
          onSalvar={adicionarGasto}
          onCancelar={() => setModalVisible(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    alignSelf: "center",
  },
  gastoItem: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  gastoDescricao: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  gastoValor: { color: "#4caf50", fontSize: 16 },
  gastoCategoria: { color: "#aaa", fontSize: 14 },
  gastoData: { color: "#888", fontSize: 12 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 40 },
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "#4caf50",
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
