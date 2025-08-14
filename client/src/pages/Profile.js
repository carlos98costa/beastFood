import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEdit, FaTrash, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import EditProfileModal from '../components/EditProfileModal';
import CreatePostModal from '../components/CreatePostModal';
import EditPostModal from '../components/EditPostModal';
import CommentsModal from '../components/CommentsModal';
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
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [postToComment, setPostToComment] = useState(null);

  // Determinar qual usuário mostrar (usuário logado ou usuário específico)
  const targetUsername = username || currentUser?.username;
  const isOwnProfile = !username || username === currentUser?.username;
  const displayUser = profileUser || currentUser;

  // Adicionar estado para controlar se já tentou buscar o perfil
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!targetUsername) {
      console.log('Sem targetUsername, aguardando...');
      return;
    }
    
    try {
      console.log('Buscando perfil para:', targetUsername);
      setHasAttemptedFetch(true);
      
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
      setHasAttemptedFetch(true);
      
      // Só redirecionar para home se for um erro 404 E não for o próprio perfil
      if (error.response?.status === 404 && !isOwnProfile) {
        console.log('Perfil não encontrado, redirecionando para home');
        navigate('/');
      } else if (error.response?.status === 404 && isOwnProfile) {
        console.log('Erro 404 no próprio perfil, mas não redirecionando');
        // Não redirecionar se for o próprio perfil
      }
    }
  }, [targetUsername, navigate, currentUser, isOwnProfile]);

  const fetchUserPosts = useCallback(async () => {
    if (!targetUsername) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/profile/${targetUsername}/posts?limit=5&offset=${(currentPage - 1) * 5}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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
    console.log('Profile useEffect - targetUsername:', targetUsername, 'currentUser:', currentUser?.username, 'loading:', loading);
    
    // Só executar se tivermos um targetUsername e não estivermos já carregando
    if (targetUsername && !loading && !hasAttemptedFetch) {
      console.log('Executando fetchUserProfile e fetchUserPosts para:', targetUsername);
      fetchUserProfile();
      fetchUserPosts();
    } else if (!targetUsername) {
      console.log('Aguardando targetUsername...');
    } else if (loading) {
      console.log('Já carregando, aguardando...');
    } else if (hasAttemptedFetch) {
      console.log('Já tentou buscar, não executando novamente');
    }
  }, [targetUsername, currentUser, loading, hasAttemptedFetch, fetchUserProfile, fetchUserPosts]);

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

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handlePostUpdated = (updatedPost) => {
    setUserPosts(posts => posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser || !window.confirm('Tem certeza que deseja deletar este post?')) return;
    
    try {
      await axios.delete(`/api/posts/${postId}`);
      setUserPosts(posts => posts.filter(post => post.id !== postId));
      // Atualizar contador de posts
      if (profileUser) {
        setProfileUser(prev => ({
          ...prev,
          posts_count: Math.max(0, (prev.posts_count || 0) - 1)
        }));
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  };

  const handlePhotoNavigation = (postId, direction) => {
    const post = userPosts.find(p => p.id === postId);
    if (!post || !post.photos) return;

    const currentIndex = currentPhotoIndex[postId] || 0;
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = post.photos.length - 1;
    } else if (newIndex >= post.photos.length) {
      newIndex = 0;
    }

    setCurrentPhotoIndex(prev => ({
      ...prev,
      [postId]: newIndex
    }));
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    
    try {
      const post = userPosts.find(p => p.id === postId);
      if (post.user_liked) {
        // Se já deu like, remover
        await handleUnlike(postId);
      } else {
        // Se não deu like, adicionar
        const response = await axios.post(`/api/likes/${postId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Atualizar o post com o novo número de likes e status de curtido
        setUserPosts(userPosts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: response.data.likes_count, user_liked: true }
            : post
        ));
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  };

  const handleUnlike = async (postId) => {
    if (!currentUser) return;
    
    try {
      const response = await axios.delete(`/api/likes/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Atualizar o post com o novo número de likes e status de curtido
      setUserPosts(userPosts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: response.data.likes_count, user_liked: false }
          : post
      ));
    } catch (error) {
      console.error('Erro ao remover like:', error);
    }
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
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
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
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="post-user-avatar default-avatar" style={{ display: post.user_profile_picture ? 'none' : 'flex' }}>
            {post.user_name?.charAt(0)}
          </div>
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
        
        <div className="post-rating">
          {renderStars(post.rating)}
          <span className="rating-text">{post.rating.toFixed(1)}/5.0</span>
        </div>
      </div>
      
      <div className="post-footer">
        <div className="post-stats">
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
              setShowCommentsModal(true);
            }}
          >
            <FaComment />
            <span>{post.comments_count || 0}</span>
          </button>
        </div>
        {currentUser && currentUser.id === post.user_id && (
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
    <div className="profile-page">
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
              <>
                {displayUser.profile_picture ? (
                  <img 
                    src={displayUser.profile_picture} 
                    alt={displayUser.name || displayUser.username}
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="profile-avatar default-avatar" style={{ display: displayUser.profile_picture ? 'none' : 'flex' }}>
                  {displayUser.name?.charAt(0) || displayUser.username?.charAt(0)}
                </div>
              </>
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
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        onCommentAdded={(newComment) => {
          setUserPosts(prev => prev.map(post => 
            post.id === postToComment.id ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
          ));
          setPostToComment(null); // Resetar o post após adicionar comentário
        }}
      />
    </div>
  );
}

export default Profile;
