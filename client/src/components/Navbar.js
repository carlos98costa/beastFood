import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUtensils, FaSearch, FaPlus, FaUser, FaSignOutAlt, FaMapMarkerAlt, FaCrown } from 'react-icons/fa';
import CreatePostModal from './CreatePostModal';
import AdminPanel from './AdminPanel';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  // location removido pois não estava sendo utilizado
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const resolveUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const isDevClient = typeof window !== 'undefined' && window.location && window.location.port === '3000';
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${isDevClient ? 'http://localhost:5000' : ''}${normalized}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const raw = searchQuery.trim();
    if (!raw) return;

    // Detecta intenções como "usuário car" ou "restaurante pizza"
    let qParam = raw;
    let typeParam = '';

    const userMatch = raw.match(/^(usu[aá]rio|usuario)\s+(.+)$/i);
    const restMatch = raw.match(/^(restaurante|restaurantes)\s+(.+)$/i);

    if (userMatch) {
      typeParam = 'users';
      qParam = userMatch[2];
    } else if (restMatch) {
      typeParam = 'restaurants';
      qParam = restMatch[2];
    }

    const url = typeParam
      ? `/search?q=${encodeURIComponent(qParam)}&type=${typeParam}`
      : `/search?q=${encodeURIComponent(qParam)}`;

    navigate(url);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (q, type) => {
    setSearchQuery(q);
    const url = type
      ? `/search?q=${encodeURIComponent(q)}&type=${type}`
      : `/search?q=${encodeURIComponent(q)}`;
    navigate(url);
    setShowSuggestions(false);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.search-form')) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const handlePostCreated = (newPost) => {
    // Fechar modal e redirecionar para o perfil do usuário
    setShowCreatePostModal(false);
    navigate(`/profile/${user.username}`);
  };

  // isActive removido pois não estava sendo utilizado

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FaUtensils className="brand-icon" />
          <span className="brand-text">BeastFood</span>
        </Link>

        <Link to="/restaurants" className="nav-link">
          <FaUtensils />
          <span>Restaurantes</span>
        </Link>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar restaurantes, usuários, cidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </div>
          
          {showSuggestions && searchQuery.trim().length >= 2 && (
            <div className="search-suggestions">
              <div className="suggestion-item" onClick={() => handleSuggestionClick(searchQuery, 'restaurants')}>
                <FaUtensils /> Buscar restaurantes com "{searchQuery}"
              </div>
              <div className="suggestion-item" onClick={() => handleSuggestionClick(searchQuery, 'users')}>
                <FaUser /> Buscar usuários com "{searchQuery}"
              </div>
              <div className="suggestion-item" onClick={() => handleSuggestionClick(searchQuery, 'restaurants')}>
                <FaMapMarkerAlt /> Buscar restaurantes em "{searchQuery}"
              </div>
            </div>
          )}
        </form>

        <div className="navbar-nav">
          {user ? (
            <>
              <button 
                onClick={() => setShowCreatePostModal(true)}
                className="nav-link create-post-button"
              >
                <FaPlus />
                <span>Novo Post</span>
              </button>
              
              {/* Botão do Painel Administrativo */}
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="nav-link admin-button"
                  title="Painel Administrativo"
                >
                  <FaCrown />
                  <span>Admin</span>
                </button>
              )}
              
              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.profile_picture ? (
                    <img 
                      src={resolveUrl(user.profile_picture)} 
                      alt={user.name}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      <FaUser />
                    </div>
                  )}
                  <span className="user-name">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link 
                      to={`/profile/${user.username}`}
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser />
                      <span>Meu Perfil</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item logout-item"
                    >
                      <FaSignOutAlt />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Entrar
              </Link>
              <Link to="/register" className="btn btn-primary">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação de Avaliação */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
        currentUser={user}
      />

      {/* Painel Administrativo */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </nav>
  );
};

export default Navbar;
