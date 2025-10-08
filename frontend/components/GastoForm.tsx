import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Gasto } from "../models/gasto";

type Props = {
  onSalvar: (gasto: Gasto) => void;
  onCancelar: () => void;
};

const categorias = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
];

export default function GastoForm({ onSalvar, onCancelar }: Props) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(categorias[0]);

const handleSalvar = () => {
    if (!descricao || !valor) return;
    const novoGasto: Gasto = {
      id: Date.now().toString(),
      descricao,
      valor: parseFloat(valor),
      categoria,
      data: new Date().toLocaleDateString(),
    };
    onSalvar(novoGasto);
    setDescricao("");
    setValor("");
    setCategoria(categorias[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Gasto</Text>
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        placeholderTextColor="#aaa"
        value={descricao}
        onChangeText={setDescricao}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor"
        placeholderTextColor="#aaa"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />
      {Platform.OS === "ios" ? (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={categoria}
            onValueChange={setCategoria}
            style={styles.picker}
          >
            {categorias.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      ) : (
        <Picker
          selectedValue={categoria}
          onValueChange={setCategoria}
          style={styles.picker}
        >
          {categorias.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancelar}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    color: "#fff",
    backgroundColor: "#222",
    marginBottom: 16,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "bold" },
  saveText: { color: "#fff", fontWeight: "bold" },
});
