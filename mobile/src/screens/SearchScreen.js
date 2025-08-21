import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { SERVER_BASE_URL } from '../utils/api';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeType, setActiveType] = useState('restaurants'); // 'restaurants' | 'users'

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    try {
      setLoading(true);
      Keyboard.dismiss();
      const response = await api.get('/search', {
        params: { q: trimmed, type: 'all', limit: 20, page: 1 },
      });

      const fetchedRestaurants = response.data?.restaurants?.items || [];
      const normalizedRestaurants = fetchedRestaurants.map((r) => ({
        ...r,
        image_url: r.image_url
          ? (String(r.image_url).startsWith('http') ? r.image_url : `${SERVER_BASE_URL}${r.image_url}`)
          : (r.main_photo_url ? (String(r.main_photo_url).startsWith('http') ? r.main_photo_url : `${SERVER_BASE_URL}${r.main_photo_url}`) : null),
        main_photo_url: r.main_photo_url
          ? (String(r.main_photo_url).startsWith('http') ? r.main_photo_url : `${SERVER_BASE_URL}${r.main_photo_url}`)
          : null,
      }));

      setRestaurants(normalizedRestaurants);
      setUsers(response.data?.users?.items || []);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
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
        <Image source={{ uri: safeUri }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <View style={styles.row}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.mutedText}>
              {item.average_rating != null ? Number(item.average_rating).toFixed(1) : 'N/A'}
            </Text>
          </View>
          {item.address ? (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.mutedText} numberOfLines={1}>{item.address}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderUser = ({ item }) => {
    const avatar = item.profile_picture ? (String(item.profile_picture).startsWith('http') ? item.profile_picture : `${SERVER_BASE_URL}${item.profile_picture}`) : PLACEHOLDERS.USER_AVATAR;
    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => navigation.navigate('Profile', { username: item.username })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: avatar }} style={styles.userAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{item.name || item.username}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const data = activeType === 'restaurants' ? restaurants : users;
  const renderItem = activeType === 'restaurants' ? renderRestaurant : renderUser;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar restaurantes e pessoas..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => { setQuery(''); setRestaurants([]); setUsers([]); }}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, activeType === 'restaurants' && styles.toggleButtonActive]}
          onPress={() => setActiveType('restaurants')}
        >
          <Text style={[styles.toggleText, activeType === 'restaurants' && styles.toggleTextActive]}>Restaurantes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activeType === 'users' && styles.toggleButtonActive]}
          onPress={() => setActiveType('users')}
        >
          <Text style={[styles.toggleText, activeType === 'users' && styles.toggleTextActive]}>Pessoas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ff6b6b" />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>{query ? 'Nenhum resultado encontrado' : 'Busque por restaurantes ou pessoas'}</Text>
            </View>
          }
        />
      )}
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#ffe3e3',
  },
  toggleText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#ff6b6b',
  },
  listContent: {
    padding: 10,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 140,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mutedText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#64748b',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userUsername: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default SearchScreen;


