import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import EditProfileModal from '../components/EditProfileModal';
import CreatePostModal from '../components/CreatePostModal';
import FollowButton from '../components/FollowButton';
import defaultAvatar from '../assets/default-avatar.svg';
import defaultCover from '../assets/default-cover.svg';
import './Profile.css';

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Determinar qual usuário mostrar (usuário logado ou usuário específico)
  const targetUsername = username || currentUser?.username;
  const isOwnProfile = !username || username === currentUser?.username;
  const displayUser = profileUser || currentUser;

  const fetchUserProfile = useCallback(async () => {
    if (!targetUsername) return;
    
    try {
      const response = await axios.get(`/api/users/profile/${targetUsername}`);
      setProfileUser(response.data.user);
      setFollowersCount(response.data.user.followers_count || 0);
      setFollowingCount(response.data.user.following_count || 0);
      
      // Verificar se o usuário atual está seguindo este perfil
      if (currentUser && !isOwnProfile) {
        try {
          const followResponse = await axios.get(`/api/users/profile/${targetUsername}/following`);
          const isUserFollowing = followResponse.data.following.some(
            user => user.id === currentUser.id
          );
          setIsFollowing(isUserFollowing);
        } catch (error) {
          console.error('Erro ao verificar status de seguindo:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      if (error.response?.status === 404) {
        navigate('/');
      }
    }
  }, [targetUsername, navigate, currentUser, isOwnProfile]);

  const fetchUserPosts = useCallback(async () => {
    if (!targetUsername) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/profile/${targetUsername}/posts?limit=5&offset=${(currentPage - 1) * 5}`);
      const { posts } = response.data;
      
      if (currentPage === 1) {
        setUserPosts(posts);
      } else {
        setUserPosts(prev => [...prev, ...posts]);
      }
      
      // Como a API não retorna paginação, vamos assumir que há mais posts se retornou o limite
      setHasMore(posts.length === 5);
    } catch (error) {
      console.error('Erro ao buscar posts do usuário:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUsername, currentPage]);

  useEffect(() => {
    if (targetUsername) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [fetchUserProfile, fetchUserPosts]);

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await axios.put('/api/users/profile', updatedData);
      setProfileUser(response.data.user);
      // Atualizar também o usuário atual no contexto se for o próprio perfil
      if (isOwnProfile) {
        // Aqui você pode atualizar o contexto de autenticação se necessário
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const handleImageUpload = async (type, imageUrl) => {
    try {
      const updateData = {
        [type === 'avatar' ? 'profile_picture' : 'cover_picture']: imageUrl
      };
      await handleProfileUpdate(updateData);
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error);
    }
  };

  const handleFollowChange = (isNowFollowing) => {
    setIsFollowing(isNowFollowing);
    setFollowersCount(prev => isNowFollowing ? prev + 1 : prev - 1);
  };

  const handlePostCreated = (newPost) => {
    // Adicionar o novo post no início da lista
    setUserPosts(prev => [newPost, ...prev]);
    // Atualizar contador de posts
    if (profileUser) {
      setProfileUser(prev => ({
        ...prev,
        posts_count: (prev.posts_count || 0) + 1
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const renderPost = (post) => (
    <div key={post.id} className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          {post.user_profile_picture ? (
            <img 
              src={post.user_profile_picture} 
              alt={post.user_name}
              className="post-user-avatar"
            />
          ) : (
            <div className="post-user-avatar default-avatar">
              <img src={defaultAvatar} alt="Avatar padrão" />
            </div>
          )}
          <div className="post-user-details">
            <h4 className="post-user-name">{post.user_name}</h4>
            <span className="post-restaurant">{post.restaurant_name}</span>
            <span className="post-date">{formatDate(post.created_at)}</span>
          </div>
        </div>
      </div>
      
      <div className="post-content">
        <p className="post-text">{post.content}</p>
        
        {post.photos && post.photos.length > 0 && (
          <div className="post-photos">
            {post.photos.map((photo, index) => (
              <img 
                key={photo.id} 
                src={photo.photo_url} 
                alt={`Foto ${index + 1}`}
                className="post-photo"
              />
            ))}
          </div>
        )}
        
        <div className="post-rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={`star ${star <= post.rating ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">{post.rating}/5</span>
        </div>
      </div>
      
      <div className="post-footer">
        <div className="post-stats">
          <span className="likes-count">
            ❤️ {post.likes_count || 0} curtidas
          </span>
          <span className="comments-count">
            💬 {post.comments_count || 0} comentários
          </span>
        </div>
      </div>
    </div>
  );

  if (!displayUser) {
    return (
      <div className="profile-container">
        <div className="loading-message">
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header do Perfil */}
      <div className="profile-header">
        <div className="profile-cover">
          {isOwnProfile ? (
            <ImageUpload
              type="cover"
              currentImage={displayUser.cover_picture}
              onUploadSuccess={(imageUrl) => handleImageUpload('cover', imageUrl)}
              onUploadError={(error) => console.error('Erro no upload:', error)}
              className="cover-upload-overlay"
            />
          ) : (
            <div 
              className="profile-cover-image"
              style={{
                backgroundImage: displayUser.cover_picture 
                  ? `url(${displayUser.cover_picture})` 
                  : `url(${defaultCover})`
              }}
            />
          )}
          
          <div className="profile-avatar-container">
            {isOwnProfile ? (
              <ImageUpload
                type="avatar"
                currentImage={displayUser.profile_picture}
                onUploadSuccess={(imageUrl) => handleImageUpload('avatar', imageUrl)}
                onUploadError={(error) => console.error('Erro no upload:', error)}
                className="avatar-upload-overlay"
              />
            ) : (
              displayUser.profile_picture ? (
                <img 
                  src={displayUser.profile_picture} 
                  alt={displayUser.name || displayUser.username}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar default-avatar">
                  <img src={defaultAvatar} alt="Avatar padrão" />
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{displayUser.name || displayUser.username}</h1>
          <p className="profile-username">@{displayUser.username}</p>
          
          {displayUser.bio && (
            <p className="profile-bio">{displayUser.bio}</p>
          )}
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{userPosts.length}</span>
              <span className="stat-label">Avaliações</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">Seguindo</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">Seguidores</span>
            </div>
          </div>
          
          <div className="profile-actions">
            {isOwnProfile ? (
              <>
                <button 
                  className="edit-profile-btn"
                  onClick={() => setShowEditModal(true)}
                >
                  Editar Perfil
                </button>
                <button 
                  className="create-post-btn"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  📝 Nova Avaliação
                </button>
              </>
            ) : (
              <FollowButton
                username={displayUser.username}
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
                className="large"
              />
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="sidebar-section">
            <h3>Informações</h3>
            <div className="info-item">
              <span className="info-label">Membro desde:</span>
              <span className="info-value">
                {displayUser.created_at ? formatDate(displayUser.created_at) : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Última atividade:</span>
              <span className="info-value">Hoje</span>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="sidebar-section">
              <h3>Ações</h3>
              <FollowButton
                username={displayUser.username}
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
                className="primary"
              />
            </div>
          )}
        </div>

        <div className="profile-main">
          <div className="feed-header">
            <h2>Avaliações Recentes</h2>
            {isOwnProfile && (
              <button 
                className="create-post-header-btn"
                onClick={() => setShowCreatePostModal(true)}
              >
                + Nova Avaliação
              </button>
            )}
          </div>
          
          <div className="posts-feed">
            {userPosts.length > 0 ? (
              userPosts.map(renderPost)
            ) : (
              <div className="no-posts">
                <div className="no-posts-icon">📝</div>
                <h3>Nenhuma avaliação ainda</h3>
                <p>Quando você fizer sua primeira avaliação, ela aparecerá aqui!</p>
                {isOwnProfile && (
                  <button 
                    className="create-first-post-btn"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    Fazer Primeira Avaliação
                  </button>
                )}
              </div>
            )}
            
            {loading && (
              <div className="loading-posts">
                <div className="spinner"></div>
                <p>Carregando mais avaliações...</p>
              </div>
            )}
            
            {!loading && hasMore && userPosts.length > 0 && (
              <button 
                className="load-more-btn"
                onClick={loadMorePosts}
              >
                Carregar Mais
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleProfileUpdate}
        user={displayUser}
        onImageUpload={handleImageUpload}
      />

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
        currentUser={currentUser}
      />
    </div>
  );
}

export default Profile;
