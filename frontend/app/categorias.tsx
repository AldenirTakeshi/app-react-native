import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService, Category } from '../services/api';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Atenção', 'Digite o nome da categoria');
      return;
    }

    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, { name: categoryName });
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso');
      } else {
        await apiService.createCategory({ name: categoryName });
        Alert.alert('Sucesso', 'Categoria criada com sucesso');
      }
      setModalVisible(false);
      setCategoryName('');
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar a categoria');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCategory(id);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso');
              loadCategories();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Categorias</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color || '#007AFF' }]} />
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
            <Text style={styles.emptySubtext}>
              Crie uma categoria para começar
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da categoria"
              placeholderTextColor="#666"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setCategoryName('');
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

