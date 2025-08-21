import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base da API (mesmo host do AuthContext)
// Ajuste para o IP da sua máquina na rede local quando testar no dispositivo físico
const API_URL = 'http://192.168.100.2:5000/api';
// Exportar URLs base para reutilizar na resolução de imagens
export const API_BASE_URL = API_URL;
export const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

// Criar uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@beastfood:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  refreshToken: async () => {
    const refreshToken = await AsyncStorage.getItem('@beastfood:refreshToken');
    if (!refreshToken) throw new Error('Refresh token não encontrado');
    
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  logout: async () => {
    const refreshToken = await AsyncStorage.getItem('@beastfood:refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Erro ao fazer logout no servidor:', error);
      }
    }
    await AsyncStorage.multiRemove(['@beastfood:token', '@beastfood:refreshToken', '@beastfood:user']);
  },
};

// Serviços de usuário
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },
};

// Serviços de restaurantes
export const restaurantService = {
  getRestaurants: async (params) => {
    const response = await api.get('/restaurants', { params });
    const restaurants = (response.data?.restaurants || []).map((r) => ({
      ...r,
      image_url: r.image_url
        ? (r.image_url.startsWith('http') ? r.image_url : `${SERVER_BASE_URL}${r.image_url}`)
        : (r.main_photo_url ? (r.main_photo_url.startsWith('http') ? r.main_photo_url : `${SERVER_BASE_URL}${r.main_photo_url}`) : null),
      main_photo_url: r.main_photo_url
        ? (r.main_photo_url.startsWith('http') ? r.main_photo_url : `${SERVER_BASE_URL}${r.main_photo_url}`)
        : null,
    }));
    return { ...response.data, restaurants };
  },
  getRestaurantById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },
  // Backend não possui rota dedicada para reviews de restaurante.
  // Usamos o feed de posts filtrando por restaurant_id e adaptamos o formato.
  getRestaurantReviews: async (id) => {
    const response = await api.get(`/posts`, { params: { restaurant_id: id } });
    const posts = response.data?.posts || [];
    return {
      reviews: posts.map((p) => ({
        id: String(p.id),
        user: {
          id: String(p.user_id),
          username: p.username,
          name: p.user_name,
          profile_picture: p.profile_picture,
        },
        rating: p.rating,
        content: p.content,
        created_at: p.created_at,
        images: Array.isArray(p.photos)
          ? p.photos
              .map((ph) => {
                 if (typeof ph === 'string') {
                   return ph.startsWith('http') ? ph : `${SERVER_BASE_URL}${ph}`;
                 }
                 return typeof ph?.photo_url === 'string'
                   ? (ph.photo_url.startsWith('http') ? ph.photo_url : `${SERVER_BASE_URL}${ph.photo_url}`)
                   : null;
               })
              .filter(Boolean)
          : [],
      })),
    };
  },
  // Fotos de restaurante ficam sob /api/restaurant-photos/restaurants/:id/photos
  getRestaurantPhotos: async (id) => {
    const response = await api.get(`/restaurant-photos/restaurants/${id}/photos`);
    return response.data; // { success, photos, count }
  },
  createRestaurant: async (restaurantData) => {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  },
  addRestaurantReview: async (id, reviewData) => {
    const response = await api.post(`/restaurants/${id}/reviews`, reviewData);
    return response.data;
  },
  // Lista de favoritos do usuário
  getFavoriteRestaurants: async (userId) => {
    const response = await api.get(`/favorites/user/${userId}`);
    return response.data;
  },
  addFavoriteRestaurant: async (restaurantId) => {
    const response = await api.post(`/favorites/${restaurantId}`);
    return response.data;
  },
  removeFavoriteRestaurant: async (restaurantId) => {
    const response = await api.delete(`/favorites/${restaurantId}`);
    return response.data;
  },
};

// Serviços de posts
export const postService = {
  getPosts: async (params) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },
  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  createPost: async (postData) => {
    try {
      let photoUrls = [];
      
      // Se há imagens, fazer upload primeiro
      if (postData.images && postData.images.length > 0) {
        console.log('Fazendo upload de', postData.images.length, 'imagens...');
        
        for (let image of postData.images) {
          const formData = new FormData();
          formData.append('photo', {
            uri: image.uri,
            type: 'image/jpeg',
            name: 'post_photo.jpg'
          });
          
          console.log('Uploading imagem:', image.uri);
          console.log('Headers da requisição:', {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${await AsyncStorage.getItem('@beastfood:token')}`
          });
          
          try {
            console.log('Tentando fazer upload para:', '/posts/upload-photo');
            const uploadResponse = await api.post('/posts/upload-photo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log('Resposta do upload:', uploadResponse.data);
            
            if (uploadResponse.data.photo_url) {
              photoUrls.push(uploadResponse.data.photo_url);
              console.log('Imagem enviada com sucesso:', uploadResponse.data.photo_url);
            }
          } catch (uploadError) {
            console.error('Erro específico no upload:', uploadError);
            console.error('Status do erro:', uploadError.response?.status);
            console.error('Dados do erro:', uploadError.response?.data);
            throw uploadError;
          }
        }
      }
      
      // Criar o post com as URLs das fotos
      const postDataJson = {
        content: postData.content,
        restaurant_id: postData.restaurant_id,
        rating: postData.rating,
        photos: photoUrls
      };
      
      console.log('Criando post com dados:', postDataJson);
      
      const response = await api.post('/posts', postDataJson, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  },
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  likePost: async (id) => {
    const response = await api.post(`/likes/${id}`);
    return response.data;
  },
  unlikePost: async (id) => {
    const response = await api.delete(`/likes/${id}`);
    return response.data;
  },
  getPostComments: async (id) => {
    const response = await api.get(`/comments/${id}`);
    return response.data;
  },
  getCommentReplies: async (commentId, params) => {
    const response = await api.get(`/comments/${commentId}/replies`, { params });
    return response.data;
  },
  // Curtir/descurtir comentário
  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data; // { liked: boolean }
  },
  addPostComment: async (id, commentData) => {
    const response = await api.post(`/comments/${id}`, commentData);
    return response.data;
  },
  deletePostComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

// Exportar a instância do axios para uso direto se necessário
export default api;