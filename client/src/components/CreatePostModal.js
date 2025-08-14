import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreatePostModal.css';

const CreatePostModal = ({ 
  isOpen, 
  onClose, 
  onPostCreated,
  currentUser 
}) => {
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    restaurant_id: '',
    restaurant_name: '',
    restaurant_address: '',
    restaurant_url: ''
  });
  const [photos, setPhotos] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestingNew, setSuggestingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchRestaurants();
    }
  }, [isOpen]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
    }
  };

  const searchRestaurants = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/restaurants?search=${encodeURIComponent(query)}`);
      setSearchResults(response.data.restaurants || []);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'searchQuery') {
      setSearchQuery(value);
      searchRestaurants(value);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setFormData(prev => ({
      ...prev,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_address: restaurant.address,
      restaurant_url: ''
    }));
    setSuggestingNew(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSuggestNewRestaurant = () => {
    setSuggestingNew(true);
    setFormData(prev => ({
      ...prev,
      restaurant_id: '',
      restaurant_name: '',
      restaurant_address: '',
      restaurant_url: ''
    }));
  };

  const uploadPhotos = async () => {
    const uploadedPhotos = [];
    
    for (const photo of photos) {
      const formData = new FormData();
      formData.append('photo', photo.file);
      
      try {
        const response = await axios.post('/api/posts/upload-photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        uploadedPhotos.push(response.data.photoUrl);
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        throw new Error('Erro ao fazer upload das fotos');
      }
    }
    
    return uploadedPhotos;
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      return newPhotos;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Por favor, escreva sua avaliação');
      return;
    }

    if (!formData.restaurant_name.trim()) {
      alert('Por favor, selecione ou sugira um restaurante');
      return;
    }

    setLoading(true);

    try {
      let restaurantId = formData.restaurant_id;

      // Se sugerindo novo restaurante, criar primeiro
      if (suggestingNew && !restaurantId) {
        const restaurantResponse = await axios.post('/api/restaurants', {
          name: formData.restaurant_name,
          address: formData.restaurant_address,
          description: `Restaurante sugerido por ${currentUser.username}`
        });
        restaurantId = restaurantResponse.data.restaurant.id;
      }

      let photoUrls = [];
      
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }

      // Criar o post
      const postResponse = await axios.post('/api/posts', {
        restaurant_id: restaurantId,
        content: formData.content,
        rating: formData.rating,
        photos: photoUrls
      });

      onPostCreated(postResponse.data.post);
      onClose();
      
      // Resetar formulário
      setFormData({
        content: '',
        rating: 5,
        restaurant_id: '',
        restaurant_name: '',
        restaurant_address: '',
        restaurant_url: ''
      });
      setPhotos([]);
      setSuggestingNew(false);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert(error.response?.data?.error || 'Erro ao criar avaliação');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Avaliação</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-section">
            <h3>Restaurante</h3>
            
            {!suggestingNew ? (
              <div className="restaurant-selection">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Buscar restaurante existente..."
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e)}
                    name="searchQuery"
                    className="search-input"
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(restaurant => (
                        <div
                          key={restaurant.id}
                          className="search-result-item"
                          onClick={() => handleRestaurantSelect(restaurant)}
                        >
                          <div className="restaurant-info">
                            <strong>{restaurant.name}</strong>
                            <span>{restaurant.address}</span>
                          </div>
                          <span className="select-hint">Selecionar</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="restaurant-list">
                  <h4>Restaurantes Recentes</h4>
                  {restaurants.slice(0, 5).map(restaurant => (
                    <div
                      key={restaurant.id}
                      className={`restaurant-item ${formData.restaurant_id === restaurant.id ? 'selected' : ''}`}
                      onClick={() => handleRestaurantSelect(restaurant)}
                    >
                      <div className="restaurant-info">
                        <strong>{restaurant.name}</strong>
                        <span>{restaurant.address}</span>
                      </div>
                      {formData.restaurant_id === restaurant.id && (
                        <span className="selected-icon">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="suggest-new-btn"
                  onClick={handleSuggestNewRestaurant}
                >
                  🆕 Sugerir Novo Restaurante
                </button>
              </div>
            ) : (
              <div className="new-restaurant-form">
                <div className="form-group">
                  <label htmlFor="restaurant_name">Nome do Restaurante *</label>
                  <input
                    type="text"
                    id="restaurant_name"
                    name="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={handleInputChange}
                    placeholder="Ex: Nonno Grill"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant_address">Endereço</label>
                  <input
                    type="text"
                    id="restaurant_address"
                    name="restaurant_address"
                    value={formData.restaurant_address}
                    onChange={handleInputChange}
                    placeholder="Ex: Rua das Flores, 123"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant_url">Link do Restaurante</label>
                  <input
                    type="url"
                    id="restaurant_url"
                    name="restaurant_url"
                    value={formData.restaurant_url}
                    onChange={handleInputChange}
                    placeholder="Ex: https://www.google.com/search?q=nono+grill"
                  />
                  <small className="form-hint">
                    Cole aqui o link do Google Maps, site oficial ou busca do Google
                  </small>
                </div>

                <button
                  type="button"
                  className="back-to-existing-btn"
                  onClick={() => setSuggestingNew(false)}
                >
                  ← Voltar para Restaurantes Existentes
                </button>
              </div>
            )}

            {formData.restaurant_name && (
              <div className="selected-restaurant">
                <strong>Restaurante Selecionado:</strong> {formData.restaurant_name}
                {formData.restaurant_address && ` - ${formData.restaurant_address}`}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Sua Avaliação</h3>
            
            <div className="form-group">
              <label htmlFor="content">Avaliação *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Conte sua experiência no restaurante..."
                rows="4"
                maxLength="1000"
                required
              />
              <span className="char-count">{formData.content.length}/1000</span>
            </div>

            <div className="form-group">
              <label htmlFor="photos">Fotos (opcional)</label>
              <input
                type="file"
                id="photos"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
              />
              <small className="form-hint">
                Selecione uma ou mais fotos para sua avaliação
              </small>
              
              {photos.length > 0 && (
                <div className="photo-preview">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo.preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="remove-photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rating">Nota</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">{formData.rating}/5.0</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-button"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
