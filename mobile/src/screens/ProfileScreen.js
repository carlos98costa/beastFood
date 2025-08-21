import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api, { SERVER_BASE_URL } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { normalizePosts } from '../utils/normalizers';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';
import { colors, spacing, typography } from '../styles/constants';

// Dados de exemplo para o perfil do usuário
const DUMMY_USER = {
  id: '1',
  name: 'João Silva',
  username: 'joaosilva',
  email: 'joao.silva@email.com',
  profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg',
  bio: 'Amante de boa comida e sempre em busca de novos restaurantes para experimentar!',
  location: 'São Paulo, SP',
  joined_date: '2023-01-15T10:30:00Z',
  followers_count: 120,
  following_count: 85,
  posts: [
    {
      id: '1',
      content: 'Visitei o Restaurante Delícia hoje e fiquei impressionado com a qualidade da comida!',
      rating: 5,
      images: [PLACEHOLDERS.RESTAURANT_BANNER],
      restaurant: {
        id: '1',
        name: 'Restaurante Delícia',
        image_url: PLACEHOLDERS.RESTAURANT_BANNER
      },
      likes_count: 45,
      comments_count: 12,
      created_at: '2023-05-10T14:30:00Z'
    },
    {
      id: '2',
      content: 'Experimentei o novo cardápio do Cantinho Japonês. Os sushis são incríveis!',
      rating: 4.5,
      images: [PLACEHOLDERS.RESTAURANT_BANNER],
      restaurant: {
        id: '2',
        name: 'Cantinho Japonês',
        image_url: PLACEHOLDERS.RESTAURANT_BANNER
      },
      likes_count: 32,
      comments_count: 8,
      created_at: '2023-05-05T18:45:00Z'
    }
  ],
  favorite_restaurants: [
    {
      id: '1',
      name: 'Restaurante Delícia',
      image_url: PLACEHOLDERS.RESTAURANT_BANNER,
      cuisine_type: 'Brasileira',
      average_rating: 4.5,
      price_range: '$$'
    },
    {
      id: '2',
      name: 'Cantinho Japonês',
      image_url: PLACEHOLDERS.RESTAURANT_BANNER,
      cuisine_type: 'Japonesa',
      average_rating: 4.7,
      price_range: '$$$'
    },
    {
      id: '3',
      name: 'Pizzaria Napolitana',
      image_url: PLACEHOLDERS.RESTAURANT_BANNER,
      cuisine_type: 'Italiana',
      average_rating: 4.3,
      price_range: '$$'
    }
  ]
};

const ProfileScreen = ({ route, navigation }) => {
  const { username } = route?.params || {};
  const { user: currentUser, logout, isAuthenticated, isGuestMode } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determinar se é o perfil do usuário atual ou de outro usuário
  const isOwnProfile = isAuthenticated && (!username || username === currentUser?.username);
  const targetUsername = isGuestMode ? null : (isOwnProfile ? currentUser?.username : username);

  // Forçar modo convidado se não estiver autenticado
  const shouldShowGuestMode = isGuestMode || !isAuthenticated;

  // Inicializar estado para convidados
  useEffect(() => {
    console.log('ProfileScreen useEffect - isGuestMode:', isGuestMode, 'loading:', loading, 'isAuthenticated:', isAuthenticated, 'shouldShowGuestMode:', shouldShowGuestMode);
    
    if (shouldShowGuestMode) {
      console.log('Inicializando modo convidado');
      setProfileUser(DUMMY_USER);
      setPosts(DUMMY_USER.posts);
      setFavorites(DUMMY_USER.favorite_restaurants);
      setLoading(false);
      return;
    }
    
    // Se não for convidado e não tiver username, definir loading como false
    if (!targetUsername) {
      setLoading(false);
    }
  }, [shouldShowGuestMode, targetUsername, isAuthenticated]);

  // Carregar perfil para usuários autenticados
  useEffect(() => {
    if (!shouldShowGuestMode && targetUsername && isAuthenticated) {
      loadUserProfile();
    }
  }, [targetUsername, shouldShowGuestMode, isAuthenticated]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Verificar se temos um username válido
      if (!targetUsername) {
        console.warn('Tentativa de carregar perfil sem username');
        setLoading(false);
        return;
      }
      
      // Buscar por username conforme rotas do backend
      const requests = [
        axios.get(`/api/users/profile/${targetUsername}`),
        axios.get(`/api/users/profile/${targetUsername}/posts`),
      ];
      if (isOwnProfile && currentUser?.id) {
        requests.push(axios.get(`/api/favorites/user/${currentUser.id}`));
      }

      const [userResponse, postsResponse, favoritesResponse] = await Promise.all(requests);

      setProfileUser(userResponse.data.user || userResponse.data);
      setPosts(normalizePosts((postsResponse.data.posts || postsResponse.data) || []));
      setFavorites((favoritesResponse?.data?.favorites) || []);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // O AppNavigator irá automaticamente redirecionar para Login
              // baseado no estado de autenticação (isAuthenticated = false)
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair da conta.');
            }
          }
        },
      ]
    );
  };



  const handleEditProfile = () => {
    // Navegar para a tela de edição de perfil
    alert('Editar perfil');
    // navigation.navigate('EditProfile');
  };

  const promptLogin = () => {
    Alert.alert(
      'Faça login',
      'Entre na sua conta para curtir, comentar e criar posts.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: () => navigation.navigate('Login') },
      ]
    );
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      return promptLogin();
    }
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      let response;
      if (post.liked) {
        response = await api.delete(`/likes/${postId}`);
      } else {
        response = await api.post(`/likes/${postId}`, {});
      }

      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                liked: !p.liked,
                likes_count: response?.data?.likes_count || (p.liked ? p.likes_count - 1 : p.likes_count + 1),
              }
            : p
        )
      );
    } catch (error) {
      console.error('Erro ao curtir post (perfil):', error);
    }
  };

  const handleEditPost = (post) => {
    navigation.navigate('EditPost', { 
      post,
      onPostUpdated: (updatedPost) => {
        setPosts(prevPosts => 
          prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
        );
      }
    });
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/posts/${postId}`);
              setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
              Alert.alert('Sucesso', 'Post deletado com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar post:', error);
              Alert.alert('Erro', 'Erro ao deletar post. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Portal de convidado: quando não autenticado e sem username específico, convidamos a fazer login
  if (shouldShowGuestMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#cbd5e1" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#64748b', textAlign: 'center', paddingHorizontal: 20 }}>
            Entre na sua conta para ver e gerenciar seu perfil. Você ainda pode explorar perfis a partir do feed.
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#ff6b6b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8 }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={{ color: '#1f2937', fontWeight: 'bold' }}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Perfil não encontrado</Text>
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

  const renderPost = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('pt-BR');
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ 
                uri: profileUser.profile_picture 
                  ? (profileUser.profile_picture.startsWith('http') 
                      ? profileUser.profile_picture 
                      : `${SERVER_BASE_URL}${profileUser.profile_picture}`)
                  : PLACEHOLDERS.USER_AVATAR
              }} 
              style={styles.userAvatar}
              onError={(error) => console.log('Erro ao carregar avatar do usuário:', error)}
            />
            <View>
              <Text style={styles.userName}>{profileUser.name}</Text>
              <Text style={styles.postDate}>{formattedDate}</Text>
            </View>
          </View>
          
          <View style={styles.postHeaderActions}>
            {item.restaurant && (
              <TouchableOpacity 
                style={styles.restaurantTag}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant.id })}
              >
                <Image 
                  source={{ 
                    uri: getSafeImageUri(item.restaurant.image_url, PLACEHOLDERS.RESTAURANT_SMALL)
                  }} 
                  style={styles.restaurantImage}
                  onError={(error) => console.log('Erro ao carregar imagem do restaurante:', error)}
                />
                <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
              </TouchableOpacity>
            )}
            
            {/* Botões de ação para o autor do post */}
            {isOwnProfile && (
              <View style={styles.postActionsMenu}>
                <TouchableOpacity
                  style={styles.actionMenuButton}
                  onPress={() => handleEditPost(item)}
                >
                  <Ionicons name="create-outline" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionMenuButton}
                  onPress={() => handleDeletePost(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.postContent}>{item.content}</Text>
        
        {item.images && item.images.length > 0 && (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.postImage}
            onError={(error) => console.log('Erro ao carregar imagem do post:', error)}
          />
        )}
        
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.liked ? 'heart' : 'heart-outline'} 
              size={22} 
              color={item.liked ? '#ff6b6b' : '#64748b'} 
            />
            <Text style={styles.actionText}>{item.likes_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostComments', { postId: item.id })}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#64748b" />
            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFavoriteRestaurant = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      <Image 
        source={{ 
          uri: getSafeImageUri(item.image_url, PLACEHOLDERS.RESTAURANT_MEDIUM)
        }} 
        style={styles.favoriteImage}
        onError={(error) => console.log('Erro ao carregar imagem do restaurante favorito:', error)}
      />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoriteCuisine}>{item.cuisine_type}</Text>
        <View style={styles.favoriteRatingRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.average_rating ? item.average_rating.toFixed(1) : '0.0'}</Text>
          </View>
          <Text style={styles.priceRange}>{item.price_range}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  console.log('ProfileScreen render - isGuestMode:', isGuestMode, 'loading:', loading, 'profileUser:', !!profileUser, 'isAuthenticated:', isAuthenticated, 'shouldShowGuestMode:', shouldShowGuestMode);
  
  // Se estiver em modo convidado ou não autenticado, mostrar sempre a tela de modo convidado
  if (shouldShowGuestMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modo Convidado</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.guestModeContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#cbd5e1" />
            <Text style={styles.guestModeTitle}>Modo Convidado</Text>
            <Text style={styles.guestModeDescription}>
              Você está explorando o BeastFood como convidado. 
              Para curtir, comentar e criar posts, faça login ou crie uma conta.
            </Text>
            
            <View style={styles.guestModeActions}>
              <TouchableOpacity 
                style={styles.guestModeButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.guestModeButtonText}>Fazer Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.guestModeButtonOutline}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.guestModeButtonOutlineText}>Criar Conta</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.guestModeInfo}>
              <Text style={styles.guestModeInfoTitle}>O que você pode fazer como convidado:</Text>
              <View style={styles.guestModeInfoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.guestModeInfoText}>Explorar restaurantes</Text>
              </View>
              <View style={styles.guestModeInfoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.guestModeInfoText}>Ver posts e comentários</Text>
              </View>
              <View style={styles.guestModeInfoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.guestModeInfoText}>Buscar por estabelecimentos</Text>
              </View>
              <View style={styles.guestModeInfoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.guestModeInfoText}>Navegar pelo sistema</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'Meu Perfil' : 'Perfil'}
        </Text>
        {isOwnProfile && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        // Loading para usuários autenticados
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      ) : (
        // Conteúdo normal para usuários autenticados
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Image 
                source={{ 
                  uri: profileUser.profile_picture 
                    ? (profileUser.profile_picture.startsWith('http') 
                        ? profileUser.profile_picture 
                        : `${SERVER_BASE_URL}${profileUser.profile_picture}`)
                    : PLACEHOLDERS.USER_AVATAR
                }} 
                style={styles.profileImage}
                onError={(error) => console.log('Erro ao carregar foto de perfil:', error)}
              />
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profileUser.followers_count || 0}</Text>
                  <Text style={styles.statLabel}>Seguidores</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profileUser.following_count || 0}</Text>
                  <Text style={styles.statLabel}>Seguindo</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileUser.name}</Text>
              <Text style={styles.profileUsername}>@{profileUser.username}</Text>
              {profileUser.bio && <Text style={styles.profileBio}>{profileUser.bio}</Text>}
              
              <View style={styles.profileDetails}>
                {profileUser.location && (
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{profileUser.location}</Text>
                  </View>
                )}
                
                {profileUser.created_at && (
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>
                      Membro desde {new Date(profileUser.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                onPress={() => setActiveTab('posts')}
              >
                <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
              </TouchableOpacity>
              
              {isOwnProfile && (
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                  onPress={() => setActiveTab('favorites')}
                >
                  <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favoritos</Text>
                </TouchableOpacity>
              )}
            </View>

            {activeTab === 'posts' && (
              <View style={styles.postsContainer}>
                <FlatList
                  data={posts}
                  renderItem={renderPost}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="document-text-outline" size={40} color="#cbd5e1" />
                      <Text style={styles.emptyText}>Você ainda não fez nenhum post</Text>
                    </View>
                  }
                />
              </View>
            )}

            {activeTab === 'favorites' && (
              <View style={styles.favoritesContainer}>
                <FlatList
                  data={favorites}
                  renderItem={renderFavoriteRestaurant}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="heart-outline" size={40} color="#cbd5e1" />
                      <Text style={styles.emptyText}>Você ainda não tem restaurantes favoritos</Text>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  profileInfo: {
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileUsername: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
    lineHeight: 20,
  },
  profileDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#64748b',
  },
  editButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
  postsContainer: {
    padding: 15,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionsMenu: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionMenuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 4,
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
  postDate: {
    fontSize: 12,
    color: '#64748b',
  },
  restaurantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  restaurantImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  restaurantName: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#64748b',
  },
  favoritesContainer: {
    padding: 15,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  favoriteImage: {
    width: 100,
    height: 100,
  },
  favoriteInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  favoriteCuisine: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  favoriteRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRange: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 10,
  },
  emptyContainer: {
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
  guestModeContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  guestModeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 10,
  },
  guestModeDescription: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  guestModeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  guestModeButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  guestModeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestModeButtonOutline: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  guestModeButtonOutlineText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestModeInfo: {
    marginTop: 20,
  },
  guestModeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  guestModeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guestModeInfoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4b5563',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ProfileScreen;