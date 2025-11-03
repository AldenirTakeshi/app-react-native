import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuDropdown from '../../../components/MenuDropdown';
import { apiService, Category, Event, Location } from '../../../services/api';
import { showImagePickerOptions } from '../../../utils/imagePicker';
import { buildImageUrl } from '../../../utils/apiConfig';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [eventRes, categoriesRes, locationsRes] = await Promise.all([
        apiService.getEventById(id),
        apiService.getCategories(),
        apiService.getLocations(),
      ]);

      if (eventRes.success) {
        const eventData = eventRes.data.event;
        setEvent(eventData);
        setName(eventData.name);
        setDescription(eventData.description);

        const eventDate = new Date(eventData.date);
        const isoString = eventDate.toISOString().split('T')[0];
        const [year, month, day] = isoString.split('-');
        setDate(`${day}-${month}-${year}`);
        setTime(eventData.time);
        setPrice(eventData.price.toString());

        const catId =
          typeof eventData.category === 'string'
            ? eventData.category
            : eventData.category.id;
        setCategoryId(catId);

        const locId =
          typeof eventData.location === 'string'
            ? eventData.location
            : eventData.location.id;
        setLocationId(locId);

        if (eventData.imageUrl) {
          setImageUrl(eventData.imageUrl);
        }
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data.categories);
      }

      if (locationsRes.success) {
        setLocations(locationsRes.data.locations);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const handlePickImage = async () => {
    const result = await showImagePickerOptions();
    if (!result.cancelled && result.uri) {
      setImageUri(result.uri);
    }
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !description ||
      !date ||
      !time ||
      !price ||
      !categoryId ||
      !locationId
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = imageUrl;

      if (imageUri) {
        try {
          const uploadResponse = await apiService.uploadImage(imageUri);
          finalImageUrl =
            uploadResponse.data.fullUrl || uploadResponse.data.url;
        } catch (error) {
          console.error('Erro no upload:', error);
          Alert.alert('Aviso', 'Imagem não foi atualizada');
        }
      }

      const eventData: any = {
        name,
        description,
        date: convertDateToISO(date),
        time,
        price: parseFloat(price),
        category: categoryId,
        location: locationId,
      };

      if (finalImageUrl !== imageUrl) {
        eventData.imageUrl = finalImageUrl || undefined;
      }

      await apiService.updateEvent(id, eventData);
      Alert.alert('Sucesso', 'Evento atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível atualizar o evento',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4)
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(
      4,
      8,
    )}`;
  };

  const convertDateToISO = (dateString: string) => {
    const parts = dateString.split('-');
    if (
      parts.length === 3 &&
      parts[0].length === 2 &&
      parts[1].length === 2 &&
      parts[2].length === 4
    ) {
      const [day, month, year] = parts;
      const isoDate = `${year}-${month}-${day}`;
      return new Date(isoDate).toISOString();
    }
    return new Date(dateString).toISOString();
  };

  const formatTimeInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  };

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return buildImageUrl(imageUrl) || imageUrl;
  };

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.logoText}>Logo</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handlePickImage}
        >
          {imageUri || imageUrl ? (
            <Image
              source={{
                uri: imageUri || getImageUrl(imageUrl) || undefined,
              }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#666" />
              <Text style={styles.imagePlaceholderText}>
                Toque para adicionar imagem
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Nome do Evento *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do evento"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o evento"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#666"
                value={date}
                onChangeText={(text) => setDate(formatDateInput(text))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Hora *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor="#666"
                value={time}
                onChangeText={(text) => setTime(formatTimeInput(text))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Preço *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#666"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <View style={styles.inputRow}>
            <Text style={styles.label}>Categoria *</Text>
            {categories.length === 0 && (
              <TouchableOpacity
                onPress={() => router.push('/categorias' as any)}
                style={styles.linkButton}
              >
                <Ionicons name="add-circle-outline" size={18} color="#007AFF" />
                <Text style={styles.linkText}>Criar categoria</Text>
              </TouchableOpacity>
            )}
          </View>
          {categories.length > 0 ? (
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setCategoryPickerVisible(true)}
            >
              <Text style={styles.pickerButtonText}>
                {categoryId
                  ? categories.find((c) => c.id === categoryId)?.name ||
                    'Selecione uma categoria'
                  : 'Selecione uma categoria'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyPicker}>
              <Text style={styles.emptyPickerText}>
                Nenhuma categoria disponível
              </Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <Text style={styles.label}>Local *</Text>
            {locations.length === 0 && (
              <TouchableOpacity
                onPress={() => router.push('/locais' as any)}
                style={styles.linkButton}
              >
                <Ionicons name="add-circle-outline" size={18} color="#007AFF" />
                <Text style={styles.linkText}>Criar local</Text>
              </TouchableOpacity>
            )}
          </View>
          {locations.length > 0 ? (
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setLocationPickerVisible(true)}
            >
              <Text style={styles.pickerButtonText}>
                {locationId
                  ? locations.find((l) => l.id === locationId)?.name ||
                    'Selecione um local'
                  : 'Selecione um local'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyPicker}>
              <Text style={styles.emptyPickerText}>
                Nenhum local disponível
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Seleção de Categoria */}
      <Modal
        visible={categoryPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Categoria</Text>
              <TouchableOpacity
                onPress={() => setCategoryPickerVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.modalOption,
                    categoryId === cat.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setCategoryId(cat.id);
                    setCategoryPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      categoryId === cat.id && styles.modalOptionTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                  {categoryId === cat.id && (
                    <Ionicons name="checkmark" size={20} color="#1E3A8A" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Local */}
      <Modal
        visible={locationPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLocationPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Local</Text>
              <TouchableOpacity
                onPress={() => setLocationPickerVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.modalOption,
                    locationId === loc.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setLocationId(loc.id);
                    setLocationPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      locationId === loc.id && styles.modalOptionTextSelected,
                    ]}
                  >
                    {loc.name}
                  </Text>
                  {locationId === loc.id && (
                    <Ionicons name="checkmark" size={20} color="#1E3A8A" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MenuDropdown
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuButton: {
    padding: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imagePlaceholderText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyPicker: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyPickerText: {
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalOptionSelected: {
    backgroundColor: '#E0F2FE',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
});
