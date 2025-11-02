import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService, Category, Event, Location } from '../../../services/api';
import { showImagePickerOptions } from '../../../utils/imagePicker';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
        setDate(eventDate.toISOString().split('T')[0]);
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
          finalImageUrl = uploadResponse.data.url;
        } catch (error) {
          console.error('Erro no upload:', error);
          Alert.alert('Aviso', 'Imagem não foi atualizada');
        }
      }

      const eventData: any = {
        name,
        description,
        date: new Date(date).toISOString(),
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
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(
      6,
      8,
    )}`;
  };

  const formatTimeInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  };

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const API_BASE_URL =
      process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    return `${API_BASE_URL}${imageUrl}`;
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Evento</Text>
          <View style={{ width: 24 }} />
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
                placeholder="YYYY-MM-DD"
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

          <Text style={styles.label}>Categoria *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={setCategoryId}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.id}
                  label={cat.name}
                  value={cat.id}
                  color="#fff"
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Local *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={locationId}
              onValueChange={setLocationId}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              {locations.map((loc) => (
                <Picker.Item
                  key={loc.id}
                  label={loc.name}
                  value={loc.id}
                  color="#fff"
                />
              ))}
            </Picker>
          </View>

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
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: 32,
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
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
    marginTop: 8,
  },
  form: {
    padding: 16,
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
  pickerContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
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
});
