import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import EditPostModal from '../components/EditPostModal';
import CommentsModal from '../components/CommentsModal';
import './Home.css';
import { resolveUrl } from '../utils/resolveUrl';

const Home = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState({});
  const [commentingPost, setCommentingPost] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Declarar funções antes dos useEffect
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get('/api/posts?limit=10');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      if (error.response?.status === 401) {
        console.log('Token expirado ou inválido ao buscar posts');
        // O interceptor do axios deve lidar com a renovação
        // Se falhar, o usuário será redirecionado para login
      }
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await axios.get('/api/restaurants?limit=6');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Detectar novos posts criados
  useEffect(() => {
    if (location.state?.newPost) {
      // Adicionar o novo post no início da lista
      setPosts(prevPosts => [location.state.newPost, ...prevPosts]);
      // Limpar o state para evitar duplicação
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLike = async (postId) => {
    if (!user || !token) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      
      if (post.user_liked) {
        // Se já deu like, remover (unlike)
        const response = await axios.delete(`/api/likes/${postId}`);
        
        // Atualizar o post com o novo número de likes e status de curtido
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: response.data.likes_count, user_liked: false }
            : post
        ));
      } else {
        // Se não deu like, adicionar
        const response = await axios.post(`/api/likes/${postId}`, {});
        
        // Atualizar o post com o novo número de likes e status de curtido
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: response.data.likes_count, user_liked: true }
            : post
        ));
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
      if (error.response?.status === 401) {
        console.log('Token expirado ou inválido ao dar like');
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleDeletePost = async (postId) => {
    if (!user || !token || !window.confirm('Tem certeza que deseja deletar este post?')) return;
    
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      if (error.response?.status === 401) {
        console.log('Token expirado ou inválido ao deletar post');
      }
    }
  };

  const handleComment = (post) => {
    setCommentingPost(post);
    setIsCommentModalOpen(true);
  };

  const handleCommentAdded = (newComment) => {
    // Atualizar o contador de comentários no post
    setPosts(posts.map(post => 
      post.id === commentingPost.id 
        ? { ...post, comments_count: Number(post.comments_count || 0) + 1 }
        : post
    ));
  };

  const handlePhotoNavigation = (postId, direction) => {
    setCurrentPhotoIndex(prev => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find(p => p.id === postId);
      if (!post || !post.photos) return prev;
      
      const newIndex = currentIndex + direction;
      if (newIndex < 0 || newIndex >= post.photos.length) return prev;
      
      return { ...prev, [postId]: newIndex };
    });
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

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star filled' : 'star'}
      />
    ));
  };

  const renderPriceRange = (price) => {
    if (!price || price < 1 || price > 5) {
      return 'Preço não informado';
    }
    return '$'.repeat(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Header da página */}
      <div className="page-header">
        <div className="hero-orb hero-orb-left" aria-hidden="true"></div>
        <div className="hero-orb hero-orb-right" aria-hidden="true"></div>
        <span className="hero-eyebrow">Comunidade gastronômica</span>
        <h1>🍽️ BeastFood</h1>
        <p>Descubra restaurantes incríveis, acompanhe avaliações reais e compartilhe suas melhores experiências gastronômicas.</p>
        <div className="hero-actions">
          <Link to={user ? '/create-post' : '/login'} className="hero-primary-action">
            Compartilhar avaliação
          </Link>
          <Link to="/restaurants" className="hero-secondary-action">
            Explorar restaurantes
          </Link>
        </div>
        <div className="hero-highlights" aria-label="Resumo da comunidade BeastFood">
          <div className="hero-highlight-card">
            <strong>{posts.length}</strong>
            <span>Avaliações recentes</span>
          </div>
          <div className="hero-highlight-card">
            <strong>{restaurants.length}</strong>
            <span>Restaurantes em destaque</span>
          </div>
          <div className="hero-highlight-card">
            <strong>4.8</strong>
            <span>Experiência média</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="content-tabs">
          <button
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Feed de Avaliações
          </button>
          <button
            className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurantes
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="posts-section">
            <div className="section-heading">
              <span className="section-kicker">Feed em tempo real</span>
              <h2 className="section-title">Últimas Avaliações</h2>
              <p className="section-subtitle">Veja o que a comunidade está provando agora.</p>
            </div>
            {posts.length === 0 ? (
              <div className="empty-state-card">
                <span className="empty-state-icon">🍜</span>
                <h3>Nenhuma avaliação por aqui ainda</h3>
                <p>Seja a primeira pessoa a compartilhar uma experiência gastronômica no BeastFood.</p>
                <Link to={user ? '/create-post' : '/login'} className="empty-state-action">
                  Criar primeira avaliação
                </Link>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                <div key={post.id} className="post-card card hover-lift">
                  <div className="post-header">
                    <div className="post-user">
                      {post.profile_picture ? (
                        <img 
                          src={resolveUrl(post.profile_picture)} 
                          alt={post.user_name}
                          className="user-avatar"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="user-avatar-placeholder" style={{ display: post.profile_picture ? 'none' : 'flex' }}>
                        {post.user_name?.charAt(0)}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{post.user_name}</span>
                        <span className="post-date">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="post-header-actions">
                      <div className="restaurant-link">
                        <Link to={`/restaurant/${post.restaurant_id}`}>
                          {post.restaurant_name}
                        </Link>
                      </div>
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

                  {post.photos && post.photos.length > 0 && (
                    <div className="post-images">
                      {post.photos.length === 1 ? (
                        <img 
                          src={resolveUrl(post.photos[0].photo_url)} 
                          alt="Post"
                          className="post-image"
                        />
                      ) : (
                        <div className="post-photos-gallery">
                          <img 
                            src={resolveUrl(post.photos[currentPhotoIndex[post.id] || 0]?.photo_url || post.photos[0].photo_url)} 
                            alt="Post"
                            className="post-image"
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

                  <div className="post-content">
                    {post.title && (
                      <h3 className="post-title">{post.title}</h3>
                    )}
                    <p className="post-text">{post.content}</p>
                    <div className="post-rating">
                      {renderStars(post.rating)}
                      <span className="rating-text">{post.rating.toFixed(1)}/5.0</span>
                    </div>
                  </div>

                  <div className="post-actions">
                    <button 
                      className={`action-button ${post.user_liked ? 'liked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      {post.user_liked ? (
                        <FaHeart className="liked" />
                      ) : (
                        <FaRegHeart />
                      )}
                      <span>{Number(post.likes_count || 0)}</span>
                    </button>
                    <button 
                      className="action-button"
                      onClick={() => handleComment(post)}
                    >
                      <FaComment />
                      <span>{Number(post.comments_count || 0)}</span>
                    </button>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="restaurants-section">
            <div className="section-heading">
              <span className="section-kicker">Curadoria local</span>
              <h2 className="section-title">Restaurantes em Destaque</h2>
              <p className="section-subtitle">Opções selecionadas para você descobrir o próximo favorito.</p>
            </div>
            {restaurants.length === 0 ? (
              <div className="empty-state-card">
                <span className="empty-state-icon">📍</span>
                <h3>Nenhum restaurante encontrado</h3>
                <p>Assim que novos lugares entrarem na plataforma, eles aparecem aqui.</p>
              </div>
            ) : (
              <div className="restaurants-grid grid-3">
                {restaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card">
                  {/* Header do card com informações principais */}
                  <div className="restaurant-header-main">
                    {/* Nome do restaurante em destaque */}
                    <h3 className="restaurant-name-main">
                      {restaurant.name || 'Nome não informado'}
                    </h3>
                    
                    {/* Tipo de cozinha */}
                    {restaurant.cuisine_type && (
                      <span className="restaurant-cuisine-main">
                        {restaurant.cuisine_type}
                      </span>
                    )}
                  </div>
                  
                  {/* Informações de avaliação e popularidade */}
                  <div className="restaurant-stats">
                    {/* Avaliação */}
                    <div className="stat-item">
                      <div className="stat-icon">⭐</div>
                      <div className="stat-content">
                        <div className="stat-value">
                          {restaurant.average_rating ? `${restaurant.average_rating}/5.0` : 'Sem avaliação'}
                        </div>
                        <div className="stat-label">
                          {restaurant.posts_count ? `${restaurant.posts_count} avaliações` : 'Nenhuma avaliação'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Favoritos */}
                    <div className="stat-item">
                      <div className="stat-icon">❤️</div>
                      <div className="stat-content">
                        <div className="stat-value">
                          {restaurant.favorites_count || 0}
                        </div>
                        <div className="stat-label">Favoritos</div>
                      </div>
                    </div>
                    
                    {/* Faixa de preço */}
                    <div className="stat-item">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <div className="stat-value">
                          {renderPriceRange(restaurant.price_range)}
                        </div>
                        <div className="stat-label">Faixa de preço</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Endereço */}
                  {restaurant.address && (
                    <div className="restaurant-location-main">
                      <FaMapMarkerAlt className="location-icon" />
                      <span className="location-text">{restaurant.address}</span>
                    </div>
                  )}
                  
                  {/* Descrição */}
                  {restaurant.description && (
                    <div className="restaurant-description-main">
                      <p>{restaurant.description}</p>
                    </div>
                  )}
                  
                  {/* Botão de ação */}
                  <div className="restaurant-footer">
                    <Link 
                      to={`/restaurant/${restaurant.id}`}
                      className="view-restaurant-btn"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditPostModal
        post={editingPost}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        onPostUpdated={handlePostUpdated}
      />

      <CommentsModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setCommentingPost(null);
        }}
        post={commentingPost}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default Home;
