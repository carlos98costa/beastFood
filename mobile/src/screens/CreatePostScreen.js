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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useLocation, useCamera } from '../hooks';
import { restaurantService, postService } from '../utils/api';
import axios from 'axios';
import { Button, Card, Modal } from '../components';
import globalStyles from '../styles/globalStyles';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Estados do post
  const [content, setContent] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados dos modais
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  // Estados para restaurantes
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestingNew, setSuggestingNew] = useState(false);
  const [newRestaurantData, setNewRestaurantData] = useState({
    name: '',
    address: '',
    description: ''
  });

  // Estados para fotos
  const [photos, setPhotos] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Estados para localização
  const [location, setLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await restaurantService.getRestaurants();
      console.log('Resposta da API restaurantes:', response);
      
      // Verificar diferentes formatos possíveis da resposta
      let restaurantsList = [];
      if (response && response.restaurants) {
        restaurantsList = response.restaurants;
      } else if (response && response.data && response.data.restaurants) {
        restaurantsList = response.data.restaurants;
      } else if (Array.isArray(response)) {
        restaurantsList = response;
      } else if (response && Array.isArray(response.data)) {
        restaurantsList = response.data;
      }
      
      console.log('Lista de restaurantes extraída:', restaurantsList);
      setRestaurants(restaurantsList || []);
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
      // Em caso de erro, usar array vazio para evitar crash
      setRestaurants([]);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Erro', 'Por favor, adicione um conteúdo ao post.');
      return;
    }

    if (!selectedRestaurant) {
      Alert.alert('Erro', 'Por favor, selecione um restaurante.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Erro', 'Por favor, adicione uma avaliação.');
      return;
    }

    try {
      setIsSubmitting(true);

      const postData = {
        content: content.trim(),
        restaurant_id: selectedRestaurant.id,
        rating: rating,
        location: location,
        photos: photos
      };

      const response = await postService.createPost(postData);
      
      Alert.alert(
        'Sucesso!',
        'Post criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar post:', error);
      Alert.alert('Erro', 'Não foi possível criar o post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handlePhotoAdd = () => {
    setShowPhotoModal(true);
  };

  const handlePhotoRemove = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowRestaurantModal(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setShowLocationPicker(false);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingChange(i)}
          style={styles.ratingStar}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? '#f59e0b' : '#9ca3af'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderPhotos = () => {
    return (
      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <Image source={{ uri: photo.uri }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => handlePhotoRemove(index)}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 5 && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhotoAdd}>
            <Ionicons name="camera-outline" size={24} color="#6b7280" />
            <Text style={styles.addPhotoButtonText}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView
        style={globalStyles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Conteúdo do post */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O que você achou?</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Conte sua experiência..."
              placeholderTextColor="#6b7280"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Seleção de restaurante */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurante</Text>
            {selectedRestaurant ? (
              <TouchableOpacity
                style={styles.restaurantButtonSelected}
                onPress={() => setShowRestaurantModal(true)}
              >
                <Image
                  source={{ uri: selectedRestaurant.image_url }}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                  <Text style={styles.restaurantAddress}>{selectedRestaurant.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addRestaurantButton}
                onPress={() => setShowRestaurantModal(true)}
              >
                <Ionicons name="location-outline" size={24} color="#3b82f6" />
                <Text style={styles.addRestaurantButtonText}>Selecionar Restaurante</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avaliação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação</Text>
            <View style={styles.ratingContainer}>
              {renderStars()}
            </View>
          </View>

          {/* Fotos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            {renderPhotos()}
          </View>

          {/* Localização */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização</Text>
            {location ? (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color="#22c55e" />
                <Text style={styles.locationText}>{location.address}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addLocationButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <Ionicons name="location-outline" size={20} color="#3b82f6" />
                <Text style={styles.addLocationButtonText}>Adicionar Localização</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão de envio */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!content.trim() || !selectedRestaurant || rating === 0) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || !selectedRestaurant || rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar Post</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Modal de restaurantes */}
        <Modal
          visible={showRestaurantModal}
          onClose={() => setShowRestaurantModal(false)}
          title="Selecionar Restaurante"
        >
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar restaurantes..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView style={styles.searchResults}>
            {restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.searchResultItem}
                onPress={() => handleRestaurantSelect(restaurant)}
              >
                <Image
                  source={{ uri: restaurant.image_url }}
                  style={styles.searchResultImage}
                />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{restaurant.name}</Text>
                  <Text style={styles.searchResultAddress}>{restaurant.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>

        {/* Modal de fotos */}
        <Modal
          visible={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          title="Adicionar Fotos"
        >
          <View style={styles.photoModalContent}>
            <TouchableOpacity style={styles.photoOption}>
              <Ionicons name="camera-outline" size={48} color="#9ca3af" />
              <Text style={styles.photoOptionText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption}>
              <Ionicons name="images-outline" size={48} color="#9ca3af" />
              <Text style={styles.photoOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  
  contentInput: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    textAlignVertical: 'top',
    minHeight: 120,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  restaurantButtonSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  
  restaurantAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  addRestaurantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  
  addRestaurantButtonText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  ratingStar: {
    marginHorizontal: 4,
  },
  
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  addPhotoButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  
  addLocationButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 8,
  },
  
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  
  locationText: {
    fontSize: 16,
    color: '#22c55e',
    marginLeft: 8,
  },
  
  submitButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  
  searchContainer: {
    marginBottom: 16,
  },
  
  searchInput: {
    fontSize: 16,
    color: '#1f2937',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  searchResults: {
    maxHeight: 200,
  },
  
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  searchResultImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  
  searchResultInfo: {
    flex: 1,
  },
  
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  
  searchResultAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  photoModalContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
  },
  
  photoOption: {
    alignItems: 'center',
    padding: 16,
  },
  
  photoOptionText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});

export default CreatePostScreen;