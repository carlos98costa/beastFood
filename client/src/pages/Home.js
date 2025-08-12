import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaMapMarkerAlt, FaStar, FaHeart, FaComment, FaUtensils } from 'react-icons/fa';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchPosts();
    fetchRestaurants();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts?limit=10');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants?limit=6');
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    
    try {
      const response = await axios.post(`/api/likes/${postId}`);
      // Atualizar o post com o novo número de likes
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: response.data.likes_count }
          : post
      ));
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star filled' : 'star'}
      />
    ));
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
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Descubra os melhores restaurantes
          </h1>
          <p className="hero-subtitle">
            Compartilhe suas experiências gastronômicas e descubra novos lugares incríveis
          </p>
          {user && (
            <Link to="/create-post" className="btn btn-primary btn-large">
              <FaUtensils />
              Criar Avaliação
            </Link>
          )}
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
            <h2 className="section-title">Últimas Avaliações</h2>
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post.id} className="post-card card hover-lift">
                  <div className="post-header">
                    <div className="post-user">
                      {post.profile_picture ? (
                        <img 
                          src={post.profile_picture} 
                          alt={post.user_name}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {post.user_name?.charAt(0)}
                        </div>
                      )}
                      <div className="user-info">
                        <span className="user-name">{post.user_name}</span>
                        <span className="post-date">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="restaurant-link">
                      <Link to={`/restaurant/${post.restaurant_id}`}>
                        {post.restaurant_name}
                      </Link>
                    </div>
                  </div>

                  {post.photos && post.photos.length > 0 && (
                    <div className="post-images">
                      <img 
                        src={post.photos[0].photo_url} 
                        alt="Post"
                        className="post-image"
                      />
                    </div>
                  )}

                  <div className="post-content">
                    {post.title && (
                      <h3 className="post-title">{post.title}</h3>
                    )}
                    <p className="post-text">{post.content}</p>
                    <div className="post-rating">
                      {renderStars(post.rating)}
                      <span className="rating-text">{post.rating}/5</span>
                    </div>
                  </div>

                  <div className="post-actions">
                    <button 
                      className="action-button"
                      onClick={() => handleLike(post.id)}
                    >
                      <FaHeart className={post.user_liked ? 'liked' : ''} />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <Link to={`/post/${post.id}`} className="action-button">
                      <FaComment />
                      <span>{post.comments_count || 0}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="restaurants-section">
            <h2 className="section-title">Restaurantes em Destaque</h2>
            <div className="restaurants-grid grid-3">
              {restaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card card hover-lift">
                  <div className="restaurant-info">
                    <h3 className="restaurant-name">{restaurant.name}</h3>
                    <p className="restaurant-description">
                      {restaurant.description || 'Sem descrição disponível'}
                    </p>
                    <div className="restaurant-meta">
                      <div className="restaurant-location">
                        <FaMapMarkerAlt />
                        <span>{restaurant.address}</span>
                      </div>
                      {restaurant.average_rating && (
                        <div className="restaurant-rating">
                          {renderStars(Math.round(restaurant.average_rating))}
                          <span className="rating-text">
                            {restaurant.average_rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="restaurant-stats">
                      <span className="stat">
                        {restaurant.posts_count || 0} avaliações
                      </span>
                      <span className="stat">
                        {restaurant.favorites_count || 0} favoritos
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/restaurant/${restaurant.id}`}
                    className="btn btn-primary btn-full"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
