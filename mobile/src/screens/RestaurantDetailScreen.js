import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService, SERVER_BASE_URL } from '../utils/api';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';
import { formatRating } from '../utils/format';

// Dados de exemplo para detalhes do restaurante
const DUMMY_RESTAURANT = {
  id: '1',
  name: 'Restaurante Delícia',
  image_url: PLACEHOLDERS.RESTAURANT_BANNER,
  address: 'Rua das Flores, 123',
  phone: '(11) 99999-9999',
  website: 'www.restaurantedelicia.com.br',
  average_rating: 4.5,
  cuisine_type: 'Brasileira',
  price_range: '$$',
  description: 'Um restaurante aconchegante com comida brasileira autêntica. Nossa especialidade é feijoada e pratos típicos regionais preparados com ingredientes frescos e locais.',
  operating_hours: [
    { day: 'Segunda-feira', hours: '11:00 - 22:00' },
    { day: 'Terça-feira', hours: '11:00 - 22:00' },
    { day: 'Quarta-feira', hours: '11:00 - 22:00' },
    { day: 'Quinta-feira', hours: '11:00 - 22:00' },
    { day: 'Sexta-feira', hours: '11:00 - 23:00' },
    { day: 'Sábado', hours: '11:00 - 23:00' },
    { day: 'Domingo', hours: '11:00 - 16:00' }
  ],
  photos: [
    PLACEHOLDERS.RESTAURANT_BANNER,
    PLACEHOLDERS.RESTAURANT_BANNER,
    PLACEHOLDERS.RESTAURANT_BANNER
  ],
  reviews: [
    {
      id: '1',
      user: {
        id: '1',
        username: 'joaosilva',
        name: 'João Silva',
        profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      rating: 5,
      content: 'Comida excelente! O atendimento foi impecável e o ambiente muito agradável.',
      created_at: '2023-05-10T14:30:00Z'
    },
    {
      id: '2',
      user: {
        id: '2',
        username: 'mariaferreira',
        name: 'Maria Ferreira',
        profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      rating: 4,
      content: 'Gostei bastante da comida, mas o tempo de espera foi um pouco longo.',
      created_at: '2023-05-05T18:45:00Z'
    }
  ]
};

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params || {};
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantDetails();
    } else {
      console.error('❌ RestaurantDetailScreen: restaurantId não fornecido');
      setLoading(false);
    }
  }, [restaurantId]);

  const loadRestaurantDetails = async () => {
    try {
      if (!restaurantId) {
        console.error('❌ loadRestaurantDetails: restaurantId inválido:', restaurantId);
        Alert.alert('Erro', 'ID do restaurante não fornecido.');
        return;
      }
      
      console.log('🔍 loadRestaurantDetails: Carregando dados para restaurantId:', restaurantId);
      setLoading(true);
      const [restaurantResponse, reviewsResponse, photosResponse] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        restaurantService.getRestaurantReviews(restaurantId),
        restaurantService.getRestaurantPhotos(restaurantId)
      ]);
      
      setRestaurant(restaurantResponse.restaurant || restaurantResponse);
      setReviews(reviewsResponse.reviews || []);
      setPhotos(photosResponse.photos || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes do restaurante:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do restaurante.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Restaurante não encontrado</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderPhoto = ({ item }) => {
    // item pode ser string (URL) ou objeto { photo_url }
    const relativeOrAbsolute = typeof item === 'string' ? item : item?.photo_url;
    const uri = getSafeImageUri(relativeOrAbsolute, PLACEHOLDERS.RESTAURANT_DETAIL);
    return <Image source={{ uri }} style={styles.galleryImage} />;
  };

  const renderReview = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('pt-BR');
    
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: getSafeImageUri(item.user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }} 
              style={styles.userAvatar} 
            />
            <View>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.reviewDate}>{formattedDate}</Text>
            </View>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{formatRating(item.rating)}</Text>
          </View>
        </View>
        
        <Text style={styles.reviewContent}>{item.content}</Text>
        
        {/* Renderizar fotos do post */}
        {item.images && item.images.length > 0 && (
          <View style={styles.reviewImagesContainer}>
            {item.images.length === 1 ? (
              <Image 
                source={{ uri: item.images[0] }} 
                style={styles.reviewSingleImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.reviewMultipleImagesContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.reviewImagesScroll}
                >
                  {item.images.map((imageUri, index) => (
                    <Image 
                      key={index}
                      source={{ uri: imageUri }} 
                      style={styles.reviewMultipleImage} 
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                {item.images.length > 1 && (
                  <View style={styles.reviewImageCounter}>
                    <Text style={styles.reviewImageCounterText}>
                      {item.images.length} fotos
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
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
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ 
            uri: getSafeImageUri(restaurant?.main_photo_url || restaurant?.image_url, PLACEHOLDERS.RESTAURANT_BANNER)
          }} 
          style={styles.coverImage} 
        />

        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>{formatRating(restaurant.average_rating)}</Text>
            </View>
            
            <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
            <Text style={styles.priceRange}>{restaurant.price_range}</Text>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Informações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
              onPress={() => setActiveTab('photos')}
            >
              <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Fotos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Avaliações</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'info' && (
            <View style={styles.infoTab}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>{restaurant.address}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>{restaurant.phone}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="globe-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>{restaurant.website}</Text>
              </View>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Sobre</Text>
                <Text style={styles.descriptionText}>{restaurant.description}</Text>
              </View>
              
              <View style={styles.hoursContainer}>
                <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>
                {(restaurant.operating_hours || []).map((item, index) => (
                  <View key={index} style={styles.hourItem}>
                    <Text style={styles.dayText}>{item.day}</Text>
                    <Text style={styles.hoursText}>{item.hours}</Text>
                  </View>
                ))}
                {(!restaurant.operating_hours || restaurant.operating_hours.length === 0) && (
                  <Text style={styles.hoursText}>Não informado</Text>
                )}
              </View>
            </View>
          )}

          {activeTab === 'photos' && (
            <View style={styles.photosTab}>
              <FlatList
                data={photos && photos.length > 0 ? photos : (restaurant.photos || [])}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
                ListEmptyComponent={
                  <View style={styles.emptyReviews}>
                    <Ionicons name="image-outline" size={40} color="#cbd5e1" />
                    <Text style={styles.emptyText}>Nenhuma foto disponível</Text>
                  </View>
                }
              />
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.reviewsTab}>
              <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyReviews}>
                    <Ionicons name="chatbubble-outline" size={40} color="#cbd5e1" />
                    <Text style={styles.emptyText}>Nenhuma avaliação disponível</Text>
                  </View>
                }
              />
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cuisineType: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 10,
  },
  priceRange: {
    fontSize: 14,
    color: '#64748b',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff6b6b',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeTabText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  infoTab: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  descriptionContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  hoursContainer: {
    marginBottom: 20,
  },
  hourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayText: {
    fontSize: 14,
    color: '#1f2937',
  },
  hoursText: {
    fontSize: 14,
    color: '#64748b',
  },
  photosTab: {
    marginTop: 10,
  },
  photosList: {
    paddingVertical: 10,
  },
  galleryImage: {
    width: 250,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  reviewsTab: {
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1f2937',
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 10,
  },
  reviewImagesContainer: {
    marginTop: 10,
  },
  reviewSingleImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  reviewMultipleImagesContainer: {
    position: 'relative',
  },
  reviewImagesScroll: {
    flexDirection: 'row',
  },
  reviewMultipleImage: {
    width: 150,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewImageCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewImageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default RestaurantDetailScreen;