import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { formatRating } from '../utils/format';
import { SERVER_BASE_URL } from '../utils/api';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';

// Dados de exemplo para restaurantes
const DUMMY_RESTAURANTS = [
  {
    id: '1',
    name: 'Restaurante Delícia',
    image_url: PLACEHOLDERS.RESTAURANT_BANNER,
    address: 'Rua das Flores, 123',
    average_rating: 4.5,
    cuisine_type: 'Brasileira',
    price_range: '$$',
    distance: '1.2 km'
  },
  {
    id: '2',
    name: 'Sabor Caseiro',
    image_url: PLACEHOLDERS.RESTAURANT_BANNER,
    address: 'Av. Principal, 456',
    average_rating: 5.0,
    cuisine_type: 'Caseira',
    price_range: '$',
    distance: '0.8 km'
  },
  {
    id: '3',
    name: 'Pizzaria Napolitana',
    image_url: PLACEHOLDERS.RESTAURANT_BANNER,
    address: 'Rua Itália, 789',
    average_rating: 4.8,
    cuisine_type: 'Italiana',
    price_range: '$$',
    distance: '2.5 km'
  }
];

const RestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/restaurants');
      console.log('Dados da API carregados:', response.data.restaurants?.length || 0, 'restaurantes');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
      console.log('Usando dados dummy:', DUMMY_RESTAURANTS.length, 'restaurantes');
      // Usar dados dummy em caso de erro
      setRestaurants(DUMMY_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRestaurants();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    try {
      if (searchQuery.trim() === '') {
        await loadRestaurants();
      } else {
        const response = await axios.get(`/api/restaurants/search?q=${encodeURIComponent(searchQuery)}`);
        setRestaurants(response.data.restaurants || []);
      }
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      Alert.alert('Erro', 'Não foi possível realizar a busca.');
    }
  };

  const renderRestaurant = ({ item }) => {
    const imageUrl = item.main_photo_url || item.image_url;
    const safeUri = getSafeImageUri(imageUrl, PLACEHOLDERS.RESTAURANT_BANNER);
    
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
      >
        <Image 
          source={{ uri: safeUri }} 
          style={styles.restaurantImage}
        />
        
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{formatRating(item.average_rating)}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="restaurant-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>{item.cuisine_type}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>{item.price_range}</Text>
            </View>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>{item.address}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="navigate-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>{item.distance}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurantes</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={async () => {
                setSearchQuery('');
                await loadRestaurants();
              }}
            >
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.restaurantsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b6b']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhum restaurante encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  restaurantsList: {
    padding: 10,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default RestaurantsScreen;