import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatRating } from '../utils/format';
import api, { SERVER_BASE_URL } from '../utils/api';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';
import { normalizePosts } from '../utils/normalizers';
import { useAuth } from '../contexts/AuthContext';
import { PostPhotoGallery, PhotoViewerModal } from '../components';

// Dados de exemplo para posts
const DUMMY_POSTS = [
  {
    id: '1',
    user: {
      id: '1',
      username: 'joaosilva',
      name: 'João Silva',
      profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    restaurant: {
      id: '1',
      name: 'Restaurante Delícia',
      image_url: PLACEHOLDERS.RESTAURANT_BANNER
    },
    content: 'Acabei de experimentar o novo prato do Restaurante Delícia. Simplesmente incrível!',
    rating: 4.5,
    created_at: '2023-05-15T14:30:00Z',
    likes_count: 24,
    comments_count: 5,
    liked: false,
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    ]
  },
  {
    id: '2',
    user: {
      id: '2',
      username: 'mariaferreira',
      name: 'Maria Ferreira',
      profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    restaurant: {
      id: '2',
      name: 'Sabor Caseiro',
      image_url: PLACEHOLDERS.RESTAURANT_BANNER
    },
    content: 'Almoço perfeito no Sabor Caseiro. Comida caseira de verdade!',
    rating: 5,
    created_at: '2023-05-14T12:15:00Z',
    likes_count: 32,
    comments_count: 8,
    liked: true,
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
    ]
  }
];

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { user, isAuthenticated, isGuestMode } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  // Recarregar posts quando o usuário mudar
  useEffect(() => {
    if (user && posts.length > 0) {
      // Recarregar posts quando o usuário for carregado
      loadPosts();
    }
  }, [user]);



  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      const normalizedPosts = normalizePosts(response.data.posts || []);
      setPosts(normalizedPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      // Usar dados dummy em caso de erro
      setPosts(DUMMY_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  };

  const promptLogin = () => {
    Alert.alert(
      'Faça login para continuar',
      'Para curtir, comentar e criar posts, faça login ou crie uma conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fazer Login', onPress: () => navigation.navigate('Login') },
        { text: 'Criar Conta', onPress: () => navigation.navigate('Register') },
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
      
      // Atualizar o estado local com a resposta do servidor
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                liked: !p.liked,
                likes_count: response.data.likes_count || (p.liked ? p.likes_count - 1 : p.likes_count + 1)
              }
            : p
        )
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      // Silenciosamente falhar para melhor UX
    }
  };

  const handleEditPost = (post) => {
    if (!isAuthenticated) {
      return promptLogin();
    }
    
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
    if (!isAuthenticated) {
      return promptLogin();
    }
    
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

  const handlePhotoPress = (photos, initialIndex = 0) => {
    setSelectedPhotos(photos);
    setSelectedPhotoIndex(initialIndex);
    setPhotoViewerVisible(true);
  };

  const closePhotoViewer = () => {
    setPhotoViewerVisible(false);
    setSelectedPhotos([]);
    setSelectedPhotoIndex(0);
  };

  const renderPost = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('pt-BR');
    

    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => navigation.navigate('Profile', { username: item.user?.username })}
          >
            <Image 
              source={{ uri: getSafeImageUri(item.user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }} 
              style={styles.userAvatar} 
            />
            <View>
              <Text style={styles.userName}>{item.user?.name || 'Usuário'}</Text>
              <Text style={styles.postDate}>{formattedDate}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.postHeaderActions}>
            {item.restaurant && (
              <TouchableOpacity 
                style={styles.restaurantTag}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant.id })}
              >
                <Image 
                  source={{ uri: getSafeImageUri(item.restaurant.image_url, PLACEHOLDERS.RESTAURANT_SMALL) }} 
                  style={styles.restaurantImageTag} 
                />
                <Text style={styles.restaurantNameTag}>{item.restaurant.name}</Text>
              </TouchableOpacity>
            )}
            
            {/* Botões de ação para o autor do post */}
            {user && item.user && (String(user.id) === String(item.user.id) || user.username === item.user.username) && (
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
        
        {/* Fotos do post */}
        {item.images && item.images.length > 0 && (
          <View style={styles.postImagesContainer}>
            <PostPhotoGallery
              photos={item.images}
              onPhotoPress={() => handlePhotoPress(item.images)}
            />
          </View>
        )}
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{formatRating(item.rating)}</Text>
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.liked ? "heart" : "heart-outline"} 
              size={22} 
              color={item.liked ? "#ff6b6b" : "#64748b"} 
            />
            <Text style={styles.actionText}>{item.likes_count}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BeastFood</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.postsList}
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
            <Text style={styles.emptyText}>Nenhuma publicação encontrada</Text>
          </View>
        }
      />
      
      {/* Botão flutuante para criar post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => (isAuthenticated ? navigation.navigate('CreatePost') : promptLogin())}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal de visualização de fotos */}
      <PhotoViewerModal
        visible={photoViewerVisible}
        photos={selectedPhotos}
        initialIndex={selectedPhotoIndex}
        onClose={closePhotoViewer}
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
    color: '#ff6b6b',
  },
  postsList: {
    padding: 8,
  },
  postCard: {
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
  restaurantImageTag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  restaurantNameTag: {
    fontSize: 12,
    color: '#64748b',
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
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1f2937',
    marginBottom: 12,
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
  postImagesContainer: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default HomeScreen;