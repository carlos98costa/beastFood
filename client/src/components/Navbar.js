import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUtensils, FaSearch, FaPlus, FaUser, FaSignOutAlt } from 'react-icons/fa';
import CreatePostModal from './CreatePostModal';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FaUtensils className="brand-icon" />
          <span className="brand-text">BeastFood</span>
        </Link>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar restaurantes, usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <FaSearch />
          </button>
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
    </nav>
  );
};

export default Navbar;
