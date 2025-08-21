import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { getSafeImageUri } from '../utils/placeholders';

const EditPostScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    content: '',
    rating: 0
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        content: post.content || '',
        rating: post.rating || 0
      });
      setExistingPhotos(post.photos || []);
      setNewPhotos([]);
      setError('');
    }
  }, [post]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const removeNewPhoto = (index) => {
    setNewPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const pickImage = async () => {
    try {
      // Solicitar permissões
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        setNewPhotos(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem');
    }
  };

  const uploadPhotos = async () => {
    const uploadedPhotos = [];
    
    for (const photo of newPhotos) {
      try {
        const formData = new FormData();
        formData.append('photo', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
        
        const response = await api.post('/posts/upload-photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        uploadedPhotos.push(response.data.photo_url);
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        throw new Error('Erro ao fazer upload das fotos');
      }
    }
    
    return uploadedPhotos;
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      setError('O conteúdo da avaliação é obrigatório');
      return;
    }

    if (formData.rating === 0) {
      setError('A avaliação é obrigatória');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let allPhotoUrls = [...existingPhotos.map(p => p.photo_url)];
      
      // Upload das novas fotos se houver
      if (newPhotos.length > 0) {
        const uploadedPhotoUrls = await uploadPhotos();
        allPhotoUrls = [...allPhotoUrls, ...uploadedPhotoUrls];
      }
      
      const response = await api.put(`/posts/${post.id}`, {
        content: formData.content,
        rating: formData.rating,
        photos: allPhotoUrls
      });

      Alert.alert(
        'Sucesso',
        'Post atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Notificar a tela anterior sobre a atualização
              if (route.params?.onPostUpdated) {
                route.params.onPostUpdated(response.data.post);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      setError(error.response?.data?.error || 'Erro ao atualizar post');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleRatingChange(index + 1)}
        style={styles.starButton}
      >
        <Ionicons
          name={index < rating ? "star" : "star-outline"}
          size={32}
          color={index < rating ? "#FFD700" : "#ccc"}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Avaliação</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Avaliação *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => handleInputChange('content', text)}
              placeholder="Conte-nos sobre sua experiência..."
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Avaliação *</Text>
            <View style={styles.ratingContainer}>
              {renderStars(formData.rating)}
              <Text style={styles.ratingText}>{formData.rating}/5</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fotos</Text>
            
            {/* Botão para adicionar nova foto */}
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={24} color="#ff6b6b" />
              <Text style={styles.addPhotoText}>Adicionar Foto</Text>
            </TouchableOpacity>
            
            {existingPhotos.length > 0 && (
              <View style={styles.existingPhotos}>
                <Text style={styles.sectionTitle}>Fotos atuais:</Text>
                <View style={styles.photoGrid}>
                  {existingPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image
                        source={{ uri: getSafeImageUri(photo.photo_url) }}
                        style={styles.photoImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removeExistingPhoto(index)}
                      >
                        <Ionicons name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {newPhotos.length > 0 && (
              <View style={styles.newPhotos}>
                <Text style={styles.sectionTitle}>Novas fotos:</Text>
                <View style={styles.photoGrid}>
                  {newPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.photoImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removeNewPhoto(index)}
                      >
                        <Ionicons name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addPhotoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  existingPhotos: {
    marginTop: 8,
  },
  newPhotos: {
    marginTop: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
});

export default EditPostScreen;
