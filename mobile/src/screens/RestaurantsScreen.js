import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { formatRating } from '../utils/format';
import { SERVER_BASE_URL } from '../utils/api';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';
import SafeImage from '../components/SafeImage';

// Dados de fallback vazios - não usar dados mockados
const EMPTY_RESTAURANTS = [];

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
      console.log('🔄 Iniciando carregamento de restaurantes...');
      
      const response = await axios.get(`${SERVER_BASE_URL}/api/estabelecimentos/estabelecimentos`);
      
      console.log('📡 Resposta da API recebida:', {
        status: response.status,
        totalEstabelecimentos: response.data?.estabelecimentos?.length || 0,
        temEstabelecimentos: !!response.data?.estabelecimentos,
        tipoResposta: typeof response.data
      });

      if (response.data && response.data.estabelecimentos && Array.isArray(response.data.estabelecimentos)) {
        console.log('✅ Dados válidos recebidos, mapeando estabelecimentos...');
        
        const mappedRestaurants = response.data.estabelecimentos.map((establishment, index) => {
          const mapped = {
            id: establishment.osm_id || establishment.id,
            name: establishment.nome,
            address: establishment.endereco || 'Endereço não informado',
            cuisine_type: establishment.tipo || 'Restaurante',
            average_rating: 4.0 + (Math.random() * 1.0),
            price_range: '$$',
            distance: '1.5 km',
            main_photo_url: establishment.main_photo_url || establishment.logo_url,
            image_url: establishment.main_photo_url || establishment.logo_url
          };
          
          console.log(`🏪 Estabelecimento ${index + 1} mapeado:`, {
            nome: mapped.name,
            tipo: mapped.cuisine_type,
            main_photo_url: mapped.main_photo_url,
            image_url: mapped.image_url,
            tem_imagem: !!mapped.main_photo_url || !!mapped.image_url,
            tamanho_imagem: mapped.main_photo_url?.length || 0
          });
          
          return mapped;
        });
        
        console.log('🎯 Total de restaurantes mapeados:', mappedRestaurants.length);
        console.log('📊 Resumo das imagens:', {
          com_main_photo: mappedRestaurants.filter(r => r.main_photo_url).length,
          com_image_url: mappedRestaurants.filter(r => r.image_url).length,
          sem_imagem: mappedRestaurants.filter(r => !r.main_photo_url && !r.image_url).length
        });
        
        setRestaurants(mappedRestaurants);
        console.log('✅ Restaurantes carregados com sucesso!');
      } else {
        console.log('⚠️ Dados inválidos recebidos, lista vazia');
        console.log('📋 Estrutura dos dados:', {
          data: response.data,
          estabelecimentos: response.data?.estabelecimentos,
          tipoEstabelecimentos: typeof response.data?.estabelecimentos,
          isArray: Array.isArray(response.data?.estabelecimentos)
        });
        setRestaurants(EMPTY_RESTAURANTS);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar restaurantes:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      setRestaurants(EMPTY_RESTAURANTS);
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
        return;
      }
      
      console.log('🔍 Buscando estabelecimentos com query:', searchQuery.trim());
      
      // Usar o endpoint correto que existe: /api/estabelecimentos/estabelecimentos/nome/:nome
      const response = await axios.get(`${SERVER_BASE_URL}/api/estabelecimentos/estabelecimentos/nome/${encodeURIComponent(searchQuery.trim())}`);
      
      console.log('📡 Resposta da busca:', {
        status: response.status,
        totalResultados: response.data?.estabelecimentos?.length || 0
      });
      
      if (response.data && response.data.estabelecimentos && Array.isArray(response.data.estabelecimentos)) {
        const mappedRestaurants = response.data.estabelecimentos.map(establishment => ({
          id: establishment.osm_id || establishment.id,
          name: establishment.nome,
          address: establishment.endereco || 'Endereço não informado',
          cuisine_type: establishment.tipo || 'Restaurante',
          average_rating: 4.0 + (Math.random() * 1.0), // Rating aleatório para demonstração
          price_range: '$$', // Preço padrão
          distance: '1.5 km',
          main_photo_url: establishment.main_photo_url || establishment.logo_url,
          image_url: establishment.main_photo_url || establishment.logo_url
        }));
        
        console.log('✅ Busca concluída:', mappedRestaurants.length, 'resultados');
        setRestaurants(mappedRestaurants);
      } else {
        console.log('⚠️ Nenhum resultado encontrado para:', searchQuery.trim());
        setRestaurants([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar restaurantes:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Se der erro na busca, mostrar mensagem amigável
      if (error.response?.status === 404) {
        Alert.alert('Nenhum resultado', `Não foram encontrados estabelecimentos para "${searchQuery.trim()}"`);
      } else {
        Alert.alert('Erro na busca', 'Não foi possível realizar a busca. Tente novamente.');
      }
      
      // Recarregar todos os restaurantes em caso de erro
      await loadRestaurants();
    }
  };

  const renderRestaurant = ({ item }) => {
    // Priorizar main_photo_url, depois image_url, depois placeholder
    const imageUrl = item.main_photo_url || item.image_url;
    const safeUri = getSafeImageUri(imageUrl, PLACEHOLDERS.RESTAURANT_BANNER);
    
    console.log(`🔍 Restaurante ${item.name}:`, {
      id: item.id,
      main_photo_url: item.main_photo_url,
      image_url: item.image_url,
      safeUri: safeUri,
      hasImage: !!imageUrl
    });
    
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
      >
        <SafeImage 
          source={{ uri: safeUri }} 
          style={styles.restaurantImage}
          fallbackSource={PLACEHOLDERS.RESTAURANT_BANNER}
          onError={(error) => {
            console.error(`❌ Erro ao carregar imagem para ${item.name}:`, error);
          }}
          onLoad={() => {
            console.log(`✅ Imagem carregada com sucesso para ${item.name}:`, safeUri);
          }}
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