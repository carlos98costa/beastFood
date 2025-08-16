import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CommentsModal from '../components/CommentsModal';
import './PostDetail.css';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Buscar detalhes do post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const postData = await response.json();
          setPost(postData);
          setCommentCount(postData.comments_count || 0);
        } else if (response.status === 404) {
          setError('Post não encontrado');
        } else {
          setError('Erro ao carregar o post');
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error);
        setError('Erro ao carregar o post');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchPost();
    }
  }, [id, token]);

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `há ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `há ${diffInDays}d`;
    }
  };

  // Renderizar estrelas da avaliação
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Navegar para o restaurante
  const handleRestaurantClick = () => {
    navigate(`/restaurant/${post.restaurant_id}`);
  };

  // Navegar para o perfil do usuário (usar username, não o id)
  const handleUserClick = () => {
    navigate(`/profile/${post.username}`);
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <div className="error-container">
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Voltar ao Feed
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container">
        <div className="error-container">
          <h2>Post não encontrado</h2>
          <p>O post que você está procurando não existe ou foi removido.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Voltar ao Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      {/* Botão voltar */}
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Voltar
        </button>
      </div>

      {/* Cabeçalho do post */}
      <div className="post-header">
        <div className="post-author" onClick={handleUserClick}>
          <div className="author-avatar">
            {post.profile_picture ? (
              <img 
                src={post.profile_picture} 
                alt={post.user_name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="author-avatar-placeholder"
              style={{ display: post.profile_picture ? 'none' : 'flex' }}
            >
              {post.user_name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="author-info">
            <span className="author-name">{post.user_name}</span>
            <span className="post-date">{formatDate(post.created_at)}</span>
          </div>
        </div>

        {/* Informações do restaurante */}
        <div className="restaurant-info" onClick={handleRestaurantClick}>
          <div className="restaurant-icon">🏪</div>
          <span className="restaurant-name">{post.restaurant_name}</span>
          <span className="restaurant-address">{post.address}</span>
        </div>
      </div>

      {/* Conteúdo do post */}
      <div className="post-content">
        {post.title && (
          <h2 className="post-title">{post.title}</h2>
        )}
        
        <p className="post-text">{post.content}</p>
        
        {/* Avaliação */}
        <div className="post-rating">
          <div className="rating-stars">
            {renderStars(post.rating)}
          </div>
          <span className="rating-text">
            Avaliação: {post.rating}/5
          </span>
        </div>
      </div>

      {/* Fotos do post */}
      {post.photos && post.photos.length > 0 && (
        <div className="post-photos">
          <div className={`photos-grid photos-grid-${Math.min(post.photos.length, 4)}`}>
            {post.photos.map((photo, index) => (
              <div key={photo.id} className="photo-item">
                <img 
                  src={photo.photo_url} 
                  alt={`Foto ${index + 1}`}
                  className="post-photo"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas do post */}
      <div className="post-stats">
        <div className="stat-item">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{post.likes_count || 0}</span>
          <span className="stat-label">Curtidas</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💬</span>
          <span className="stat-value">{commentCount}</span>
          <span className="stat-label">Comentários</span>
        </div>
      </div>

      {/* Botão para abrir comentários */}
      <div className="comments-section">
        <button 
          className="view-comments-btn"
          onClick={() => setIsCommentsModalOpen(true)}
        >
          💬 Ver Comentários ({commentCount})
        </button>
      </div>

      {/* Sistema de comentários */}
      <CommentsModal 
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        post={post}
        onCommentAdded={(comment, increment) => {
          if (comment) {
            setCommentCount(prev => prev + 1);
          } else if (increment === -1) {
            setCommentCount(prev => Math.max(0, prev - 1));
          }
        }}
      />
    </div>
  );
}

export default PostDetail;
