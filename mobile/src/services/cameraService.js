import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

class CameraService {
  constructor() {
    this.defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };
  }

  // Solicitar permissões da câmera
  async requestCameraPermissions() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Para tirar fotos, precisamos acessar sua câmera.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => ImagePicker.openAppSettingsAsync?.() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões da câmera:', error);
      return false;
    }
  }

  // Solicitar permissões da galeria
  async requestMediaLibraryPermissions() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Para selecionar fotos da galeria, precisamos acessar suas fotos.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => ImagePicker.openAppSettingsAsync?.() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões da galeria:', error);
      return false;
    }
  }

  // Capturar foto com a câmera
  async capturePhoto(options = {}) {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        throw new Error('Permissão da câmera negada');
      }

      const finalOptions = {
        ...this.defaultOptions,
        ...options
      };

      const result = await ImagePicker.launchCameraAsync(finalOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileSize: asset.fileSize,
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      throw this.handleImageError(error);
    }
  }

  // Selecionar imagem da galeria
  async pickImageFromGallery(options = {}) {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        throw new Error('Permissão da galeria negada');
      }

      const finalOptions = {
        ...this.defaultOptions,
        ...options
      };

      const result = await ImagePicker.launchImageLibraryAsync(finalOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileSize: asset.fileSize,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      throw this.handleImageError(error);
    }
  }

  // Selecionar múltiplas imagens da galeria
  async pickMultipleImages(options = {}) {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        throw new Error('Permissão da galeria negada');
      }

      const finalOptions = {
        ...this.defaultOptions,
        allowsMultipleSelection: true,
        allowsEditing: false, // Desabilitar edição quando seleção múltipla está ativa
        selectionLimit: options.limit || 10,
        ...options
      };

      const result = await ImagePicker.launchImageLibraryAsync(finalOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets.map((asset, index) => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileSize: asset.fileSize,
          fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao selecionar múltiplas imagens:', error);
      throw this.handleImageError(error);
    }
  }

  // Mostrar opções de seleção de imagem
  async showImagePickerOptions(options = {}) {
    return new Promise((resolve) => {
      Alert.alert(
        options.title || 'Selecionar Imagem',
        options.message || 'Escolha uma opção:',
        [
          {
            text: 'Câmera',
            onPress: async () => {
              try {
                const result = await this.capturePhoto(options);
                resolve(result);
              } catch (error) {
                resolve(null);
              }
            }
          },
          {
            text: 'Galeria',
            onPress: async () => {
              try {
                const result = await this.pickImageFromGallery(options);
                resolve(result);
              } catch (error) {
                resolve(null);
              }
            }
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null)
          }
        ]
      );
    });
  }

  // Salvar imagem na galeria
  async saveToGallery(uri, albumName = 'BeastFood') {
    try {
      // Solicitar permissão para salvar na galeria
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Para salvar a imagem, precisamos acessar sua galeria.'
        );
        return false;
      }

      // Criar asset da imagem
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      // Criar ou encontrar o álbum
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert('Sucesso', 'Imagem salva na galeria!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar imagem na galeria:', error);
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
      return false;
    }
  }

  // Redimensionar imagem
  async resizeImage(uri, options = {}) {
    try {
      const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
      
      const defaultOptions = {
        resize: { width: 800, height: 800 },
        compress: 0.8,
        format: SaveFormat.JPEG,
        ...options
      };

      const actions = [];
      
      if (defaultOptions.resize) {
        actions.push({ resize: defaultOptions.resize });
      }
      
      if (defaultOptions.rotate) {
        actions.push({ rotate: defaultOptions.rotate });
      }
      
      if (defaultOptions.crop) {
        actions.push({ crop: defaultOptions.crop });
      }

      const result = await manipulateAsync(
        uri,
        actions,
        {
          compress: defaultOptions.compress,
          format: defaultOptions.format
        }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      throw error;
    }
  }

  // Converter imagem para base64
  async imageToBase64(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw error;
    }
  }

  // Preparar imagem para upload
  async prepareImageForUpload(image, options = {}) {
    try {
      let processedImage = image;
      
      // Redimensionar se necessário
      if (options.resize) {
        processedImage = await this.resizeImage(image.uri, {
          resize: options.resize,
          compress: options.compress || 0.8
        });
      }

      // Criar FormData para upload
      const formData = new FormData();
      
      const imageFile = {
        uri: processedImage.uri,
        type: image.mimeType || 'image/jpeg',
        name: image.fileName || `image_${Date.now()}.jpg`
      };

      formData.append('image', imageFile);
      
      // Adicionar campos extras se fornecidos
      if (options.extraFields) {
        Object.keys(options.extraFields).forEach(key => {
          formData.append(key, options.extraFields[key]);
        });
      }

      return formData;
    } catch (error) {
      console.error('Erro ao preparar imagem para upload:', error);
      throw error;
    }
  }

  // Validar imagem
  validateImage(image, options = {}) {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    const maxWidth = options.maxWidth || 4000;
    const maxHeight = options.maxHeight || 4000;

    if (image.fileSize && image.fileSize > maxSize) {
      throw new Error(`Imagem muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (image.mimeType && !allowedTypes.includes(image.mimeType)) {
      throw new Error(`Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.join(', ')}`);
    }

    if (image.width > maxWidth || image.height > maxHeight) {
      throw new Error(`Dimensões muito grandes. Máximo: ${maxWidth}x${maxHeight}px`);
    }

    return true;
  }

  // Tratar erros de imagem
  handleImageError(error) {
    if (error.message.includes('permission')) {
      return new Error('Permissão negada para acessar câmera ou galeria.');
    } else if (error.message.includes('cancelled')) {
      return new Error('Operação cancelada pelo usuário.');
    } else {
      return new Error('Erro ao processar imagem. Tente novamente.');
    }
  }
}

// Instância singleton
const cameraService = new CameraService();

export default cameraService;

// Exportar também a classe para casos específicos
export { CameraService };