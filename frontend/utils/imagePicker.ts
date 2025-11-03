import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  cancelled: boolean;
}

export async function pickImageFromGallery(): Promise<ImagePickerResult> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos!',
      );
      return { uri: '', cancelled: true };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) {
      return { uri: '', cancelled: true };
    }

    return {
      uri: result.assets[0].uri,
      cancelled: false,
    };
  } catch (error) {
    console.error('Erro ao selecionar imagem:', error);
    Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    return { uri: '', cancelled: true };
  }
}

export async function pickImageFromCamera(): Promise<ImagePickerResult> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para usar sua câmera!',
      );
      return { uri: '', cancelled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) {
      return { uri: '', cancelled: true };
    }

    return {
      uri: result.assets[0].uri,
      cancelled: false,
    };
  } catch (error) {
    console.error('Erro ao tirar foto:', error);
    Alert.alert('Erro', 'Não foi possível tirar a foto');
    return { uri: '', cancelled: true };
  }
}

export async function showImagePickerOptions(): Promise<ImagePickerResult> {
  return new Promise((resolve) => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            const result = await pickImageFromCamera();
            resolve(result);
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const result = await pickImageFromGallery();
            resolve(result);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve({ uri: '', cancelled: true }),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve({ uri: '', cancelled: true }),
      },
    );
  });
}
