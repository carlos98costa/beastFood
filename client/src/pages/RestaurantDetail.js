import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone, 
  FaGlobe, 
  FaHeart, 
  FaRegHeart,
  FaUtensils, 
  FaClock,
  FaDollarSign,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaComment
} from 'react-icons/fa';
import axios from 'axios';
import EditPostModal from '../components/EditPostModal';
import CommentsModal from '../components/CommentsModal';
import EditRestaurantModal from '../components/EditRestaurantModal';
import RestaurantPhotos from '../components/RestaurantPhotos';
import RestaurantCard from '../components/RestaurantCard';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    rating: 5
  });
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState({});
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [postToComment, setPostToComment] = useState(null);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [restaurantToEdit, setRestaurantToEdit] = useState(null);

  // Função para abrir modal de edição
  const handleEditRestaurant = useCallback(() => {
    setRestaurantToEdit(restaurant);
    setShowEditRestaurantModal(true);
  }, [restaurant]);

  // Função para fechar modal de edição
  const handleCloseEditModal = useCallback(() => {
    setShowEditRestaurantModal(false);
    setRestaurantToEdit(null);
  }, []);

  // Função para restaurante atualizado
  const handleRestaurantUpdated = useCallback((updatedRestaurant) => {
    // Atualizar o restaurante na página
    setRestaurant(updatedRestaurant);
    setShowEditRestaurantModal(false);
    setRestaurantToEdit(null);
  }, []);

  // Verificar se o usuário pode editar o restaurante
  const canEditRestaurant = useMemo(() => {
    return user && (
      user.role === 'admin' || 
      user.role === 'owner' || 
      (restaurant && restaurant.owner_id === user.id)
    );
  }, [user, restaurant]);

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
      fetchRestaurantPosts();
    }
  }, [id]); // Remover user das dependências

  // useEffect separado para verificar favorito quando user mudar
  useEffect(() => {
    if (id && user) {
      checkIfFavorite();
    }
  }, [id, user]);

  const fetchRestaurantDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/restaurants/${id}`);
      setRestaurant(response.data.restaurant);
    } catch (error) {
      console.error('Erro ao buscar detalhes do restaurante:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRestaurantPosts = useCallback(async () => {
    try {
      const response = await axios.get(`/api/posts?restaurant_id=${id}&limit=20`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Erro ao buscar posts do restaurante:', error);
    }
  }, [id]);

  const checkIfFavorite = useCallback(async () => {
    try {
      const response = await axios.get(`/api/restaurants/${id}/favorite`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  }, [id]);

  const toggleFavorite = useCallback(async () => {
    if (!user) return;
    
    try {
      if (isFavorite) {
        await axios.delete(`/api/restaurants/favorites/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorite(false);
      } else {
        await axios.post(`/api/restaurants/favorites`, { restaurantId: id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  }, [user, isFavorite, id]);

  const handleEditPost = useCallback((post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  }, []);

  const handlePostUpdated = useCallback((updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  }, [posts]);

  const handleDeletePost = useCallback(async (postId) => {
    if (!user || !window.confirm('Tem certeza que deseja deletar este post?')) return;
    
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      // Atualizar contador de posts
      setRestaurant(prev => ({
        ...prev,
        posts_count: (prev.posts_count || 0) - 1
      }));
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  }, [user, posts]);

  const handlePhotoNavigation = useCallback((postId, direction) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.photos) return;

    const currentIndex = currentPhotoIndex[postId] || 0;
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % post.photos.length;
    } else {
      newIndex = (currentIndex - 1 + post.photos.length) % post.photos.length;
    }

    setCurrentPhotoIndex(prev => ({
      ...prev,
      [postId]: newIndex
    }));
  }, [posts, currentPhotoIndex]);

  const handleUnlike = useCallback(async (postId) => {
    if (!user) return;
    
    try {
      const response = await axios.delete(`/api/likes/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Atualizar o post com o novo número de likes e status de curtido
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: response.data.likes_count, user_liked: false }
          : post
      ));
    } catch (error) {
      console.error('Erro ao remover like:', error);
    }
  }, [user, posts]);

  const handleLike = useCallback(async (postId) => {
    if (!user) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      if (post.user_liked) {
        // Se já deu like, remover
        await handleUnlike(postId);
      } else {
        // Se não deu like, adicionar
        const response = await axios.post(`/api/likes/${postId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Atualizar o post com o novo número de likes e status de curtido
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: response.data.likes_count, user_liked: true }
            : post
        ));
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  }, [user, posts, handleUnlike]);

  const handleCreatePost = useCallback(async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await axios.post('/api/posts', {
        title: newPost.content.substring(0, 100),
        content: newPost.content,
        rating: newPost.rating,
        restaurant_id: id
      });

      // Limpar formulário e recarregar posts
      setNewPost({ content: '', rating: 5 });
      setShowCreatePost(false);
      fetchRestaurantPosts();
    } catch (error) {
      console.error('Erro ao criar post:', error);
    }
  }, [user, newPost, id, fetchRestaurantPosts]);

  // Objeto memoizado para o formato do RestaurantCard
  const restaurantCardData = useMemo(() => {
    if (!restaurant) return null;
    
    return {
      name: restaurant.name,
      rating: parseFloat(restaurant.average_rating) || 0,
      reviewCount: restaurant.posts_count ? `${restaurant.posts_count}` : "0",
      cuisine: restaurant.cuisine_type || "Não especificado",
      address: restaurant.address || "Endereço não disponível",
      phone: restaurant.phone || "Telefone não disponível",
      description: restaurant.description || "Descrição não disponível",
      serviceOptions: restaurant.service_options || ["Delivery", "Reservas"],
      highlights: restaurant.highlights || ["Ambiente familiar", "Boa localização"],
      status: restaurant.is_open ? "Aberto" : "Fechado",
      nextOpen: restaurant.is_open ? "Aberto agora" : "Abre às 11:00",
      photos: restaurant.photos ? restaurant.photos.map(p => p.photo_url || p.url || p) : [],
      isFavorite: isFavorite
    };
  }, [restaurant, isFavorite]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star filled' : 'star'}
      />
    ));
  };

  const renderPriceRange = (price) => {
    return 'R$'.repeat(price || 3);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Calcular diferença em milissegundos
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Retornar texto relativo para datas recentes
    if (diffMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffMinutes < 60) {
      return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else {
      // Para datas mais antigas, usar formato completo
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes do restaurante...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-container">
        <h2>Restaurante não encontrado</h2>
        <p>O restaurante que você está procurando não existe ou foi removido.</p>
        <Link to="/restaurants" className="btn btn-primary">
          <FaArrowLeft />
          Voltar aos Restaurantes
        </Link>
      </div>
    );
  }

  return (
    <div className="restaurant-detail-page">
      {/* Header com navegação */}
      <div className="detail-header">
        <Link to="/restaurants" className="back-button">
          <FaArrowLeft />
          Voltar aos Restaurantes
        </Link>
      </div>

      {/* RestaurantCard horizontal compacto */}
      <div className="restaurant-card-container">
        <RestaurantCard 
          restaurant={restaurantCardData}
          onToggleFavorite={toggleFavorite}
          onEdit={handleEditRestaurant}
          canEdit={canEditRestaurant}
          isLoggedIn={!!user}
        />
      </div>

      {/* Seção de posts e avaliações */}
      <div className="posts-section">
        <div className="posts-header">
          <h2>Avaliações e Experiências</h2>
          {user && (
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="btn btn-primary"
            >
              <FaPlus />
              Nova Avaliação
            </button>
          )}
        </div>

        {/* Formulário para criar nova avaliação */}
        {showCreatePost && (
          <div className="create-post-form">
            <h3>Nova Avaliação</h3>
            <form onSubmit={handleCreatePost}>


              <div className="form-group">
                <label>Avaliação:</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewPost({...newPost, rating: star})}
                      className={`star-button ${star <= newPost.rating ? 'active' : ''}`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Conteúdo:</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Conte sua experiência neste restaurante..."
                  rows="4"
                  required
                />
              </div>



              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Publicar Avaliação
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de posts */}
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    {post.profile_picture ? (
                      <img 
                        src={post.profile_picture} 
                        alt={post.user_name}
                        className="author-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="author-avatar-placeholder" style={{ display: post.profile_picture ? 'none' : 'flex' }}>
                      {post.user_name?.charAt(0)}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{post.user_name}</span>
                      <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div className="post-rating">
                    {renderStars(post.rating)}
                  </div>
                </div>



                <p className="post-content">{post.content}</p>

                {post.photos && post.photos.length > 0 && (
                  <div className="post-photos">
                    {post.photos.length === 1 ? (
                      <img 
                        src={post.photos[0].photo_url} 
                        alt="Foto do post"
                        className="post-photo"
                      />
                    ) : (
                      <div className="post-photos-gallery">
                        <img 
                          src={post.photos[currentPhotoIndex[post.id] || 0]?.photo_url || post.photos[0].photo_url} 
                          alt="Foto do post"
                          className="post-photo"
                        />
                        {post.photos.length > 1 && (
                          <div className="photo-navigation">
                            <button 
                              className="nav-arrow prev-arrow"
                              onClick={() => handlePhotoNavigation(post.id, -1)}
                              title="Foto anterior"
                            >
                              ‹
                            </button>
                            <span className="photo-counter">
                              {(currentPhotoIndex[post.id] || 0) + 1} / {post.photos.length}
                            </span>
                            <button 
                              className="nav-arrow next-arrow"
                              onClick={() => handlePhotoNavigation(post.id, 1)}
                              title="Próxima foto"
                            >
                              ›
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="post-actions">
                  <button 
                    className="action-button"
                    onClick={() => handleLike(post.id)}
                  >
                    {post.user_liked ? (
                      <FaHeart className="liked" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => {
                      setPostToComment(post);
                      setIsCommentsModalOpen(true);
                    }}
                  >
                    <FaComment />
                    <span>{post.comments_count || 0}</span>
                  </button>
                  {user && user.id === post.user_id && (
                    <div className="post-actions-menu">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEditPost(post)}
                        title="Editar post"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeletePost(post.id)}
                        title="Deletar post"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
              <FaUtensils className="no-posts-icon" />
              <h3>Nenhuma avaliação ainda</h3>
              <p>Seja o primeiro a compartilhar sua experiência neste restaurante!</p>
              {user && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="btn btn-primary"
                >
                  <FaPlus />
                  Primeira Avaliação
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição de Post */}
      <EditPostModal
        post={editingPost}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        onPostUpdated={handlePostUpdated}
      />

      {/* Modal de Comentários */}
      <CommentsModal
        post={postToComment}
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false);
          setPostToComment(null);
        }}
        onCommentAdded={(newComment, increment) => {
          if (newComment) {
            // Atualizar contador de comentários no post
            setPosts(prev => 
              prev.map(post => 
                post.id === postToComment.id 
                  ? { ...post, comments_count: (post.comments_count || 0) + 1 }
                  : post
              )
            );
          } else if (increment === -1) {
            // Decrementar contador quando comentário é deletado
            setPosts(prev => 
              prev.map(post => 
                post.id === postToComment.id 
                  ? { ...post, comments_count: Math.max(0, (post.comments_count || 0) - 1) }
                  : post
              )
            );
          }
        }}
      />

      {/* Modal de Edição de Restaurante */}
      {showEditRestaurantModal && restaurant && (
        <EditRestaurantModal
          restaurant={restaurantToEdit}
          isOpen={showEditRestaurantModal}
          onClose={handleCloseEditModal}
          onRestaurantUpdated={handleRestaurantUpdated}
        />
      )}
    </div>
  );
};

export default RestaurantDetail;

