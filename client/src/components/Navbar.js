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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
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
              <div className="suggestion-item" onClick={() => handleSuggestionClick(`restaurante ${searchQuery}`)}>
                <FaUtensils /> Buscar restaurantes com "{searchQuery}"
              </div>
              <div className="suggestion-item" onClick={() => handleSuggestionClick(`usuário ${searchQuery}`)}>
                <FaUser /> Buscar usuários com "{searchQuery}"
              </div>
              <div className="suggestion-item" onClick={() => handleSuggestionClick(`${searchQuery} restaurante`)}>
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
                      src={user.profile_picture} 
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
