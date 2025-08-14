import React, { useState, useEffect } from 'react';
import { FaEdit, FaUpload, FaSave, FaTimes, FaMapMarkerAlt, FaUtensils, FaGlobe, FaImage } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from './ImageUpload';
import './EditRestaurantModal.css';

const EditRestaurantModal = ({ restaurant, isOpen, onClose, onRestaurantUpdated }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    cuisine_type: '',
    price_range: '',
    source_type: '',
    source_id: ''
  });
  
  const [images, setImages] = useState({
    main_photo: null,
    logo: null
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState({
    main_photo: null,
    logo: null
  });

  // Configurar axios com token
  const restaurantAxios = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    if (token) {
      restaurantAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    if (restaurant && isOpen) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        website: restaurant.website || '',
        cuisine_type: restaurant.cuisine_type || '',
        price_range: restaurant.price_range || '',
        source_type: restaurant.source_type || 'OSM',
        source_id: restaurant.source_id || ''
      });

      // Configurar previews de imagens existentes
      if (restaurant.main_photo_url) {
        setImagePreview(prev => ({ ...prev, main_photo: restaurant.main_photo_url }));
      }
      if (restaurant.logo_url) {
        setImagePreview(prev => ({ ...prev, logo: restaurant.logo_url }));
      }
    }
  }, [restaurant, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUpload = async (type, file) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      formData.append('restaurantId', restaurant.id);

      const response = await restaurantAxios.post('/api/restaurants/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setImages(prev => ({
          ...prev,
          [type]: file
        }));
        
        setImagePreview(prev => ({
          ...prev,
          [type]: URL.createObjectURL(file)
        }));

        // Atualizar o restaurante com a nova URL da imagem
        if (type === 'main_photo') {
          restaurant.main_photo_url = response.data.imageUrl;
        } else if (type === 'logo') {
          restaurant.logo_url = response.data.imageUrl;
        }
      }
    } catch (error) {
      console.error(`Erro ao fazer upload da ${type}:`, error);
      setErrors(prev => ({
        ...prev,
        [type]: 'Erro ao fazer upload da imagem'
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }
    
    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website deve começar com http:// ou https://';
    }
    
    if (formData.price_range && (formData.price_range < 1 || formData.price_range > 5)) {
      newErrors.price_range = 'Faixa de preço deve ser entre 1 e 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        ...formData,
        id: restaurant.id,
        // Garantir que price_range seja um número
        price_range: formData.price_range ? parseInt(formData.price_range) : null
      };

      // Debug: log dos dados sendo enviados
      console.log('Dados sendo enviados para atualização:', updateData);
      console.log('Tipo do price_range:', typeof updateData.price_range, 'Valor:', updateData.price_range);

      const response = await restaurantAxios.put(`/api/restaurants/${restaurant.id}`, updateData);
      
      if (response.data.success) {
        // Atualizar o restaurante local
        Object.assign(restaurant, response.data.restaurant);
        
        // Chamar callback para atualizar a interface
        if (onRestaurantUpdated) {
          onRestaurantUpdated(response.data.restaurant);
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      console.error('Resposta do servidor:', error.response?.data);
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.error || 'Erro ao atualizar restaurante'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSourceTypeChange = (e) => {
    const newSourceType = e.target.value;
    setFormData(prev => ({
      ...prev,
      source_type: newSourceType,
      source_id: newSourceType === 'Manual' ? '' : prev.source_id
    }));
  };

  const renderSourceInfo = () => {
    if (formData.source_type === 'OSM') {
      return (
        <div className="source-info osm">
          <FaGlobe className="source-icon" />
          <span>Importado do OpenStreetMap</span>
          {formData.source_id && (
            <span className="source-id">ID: {formData.source_id}</span>
          )}
        </div>
      );
    } else if (formData.source_type === 'Google Places') {
      return (
        <div className="source-info google">
          <FaGlobe className="source-icon" />
          <span>Importado do Google Places</span>
          {formData.source_id && (
            <span className="source-id">ID: {formData.source_id}</span>
          )}
        </div>
      );
    } else {
      return (
        <div className="source-info manual">
          <FaEdit className="source-icon" />
          <span>Criado manualmente</span>
        </div>
      );
    }
  };

  if (!isOpen || !restaurant) return null;

  return (
    <div className="edit-restaurant-modal-overlay">
      <div className="edit-restaurant-modal">
        <div className="modal-header">
          <h2>✏️ Editar Restaurante</h2>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Informações Básicas */}
          <div className="form-section">
            <h3>📋 Informações Básicas</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Nome do restaurante"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="cuisine_type">Tipo de Cozinha</label>
                <select
                  id="cuisine_type"
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione...</option>
                  <option value="Brasileira">Brasileira</option>
                  <option value="Italiana">Italiana</option>
                  <option value="Japonesa">Japonesa</option>
                  <option value="Chinesa">Chinesa</option>
                  <option value="Mexicana">Mexicana</option>
                  <option value="Árabe">Árabe</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Pizzaria">Pizzaria</option>
                  <option value="Churrascaria">Churrascaria</option>
                  <option value="Padaria">Padaria</option>
                  <option value="Bar">Bar</option>
                  <option value="Café">Café</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Descreva o restaurante..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Endereço *</label>
                <div className="input-with-icon">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="Endereço completo"
                  />
                </div>
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="price_range">Faixa de Preço</label>
                <select
                  id="price_range"
                  name="price_range"
                  value={formData.price_range}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione...</option>
                  <option value="1">$ - Econômico</option>
                  <option value="2">$$ - Moderado</option>
                  <option value="3">$$$ - Caro</option>
                  <option value="4">$$$$ - Muito Caro</option>
                  <option value="5">$$$$$ - Luxuoso</option>
                </select>
                {errors.price_range && <span className="error-message">{errors.price_range}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={errors.website ? 'error' : ''}
                  placeholder="https://exemplo.com"
                />
                {errors.website && <span className="error-message">{errors.website}</span>}
              </div>
            </div>
          </div>

          {/* Fonte do Estabelecimento */}
          <div className="form-section">
            <h3>🔗 Fonte do Estabelecimento</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source_type">Tipo de Fonte</label>
                <select
                  id="source_type"
                  name="source_type"
                  value={formData.source_type}
                  onChange={handleSourceTypeChange}
                >
                  <option value="OSM">OpenStreetMap</option>
                  <option value="Google Places">Google Places</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              
              {formData.source_type !== 'Manual' && (
                <div className="form-group">
                  <label htmlFor="source_id">ID da Fonte</label>
                  <input
                    type="text"
                    id="source_id"
                    name="source_id"
                    value={formData.source_id}
                    onChange={handleInputChange}
                    placeholder="ID original da fonte"
                  />
                </div>
              )}
            </div>

            {renderSourceInfo()}
          </div>

          {/* Imagens */}
          <div className="form-section">
            <h3>🖼️ Imagens</h3>
            
            <div className="images-grid">
              <div className="image-upload-group">
                <label>Foto Principal</label>
                <div className="image-upload-area">
                  {imagePreview.main_photo ? (
                    <img 
                      src={imagePreview.main_photo} 
                      alt="Foto principal" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <FaImage />
                      <span>Nenhuma foto</span>
                    </div>
                  )}
                  
                  <ImageUpload
                    onUploadSuccess={(imageUrl) => {
                      setImagePreview(prev => ({ ...prev, main_photo: imageUrl }));
                      setImages(prev => ({ ...prev, main_photo: imageUrl }));
                    }}
                    onUploadError={(error) => {
                      setErrors(prev => ({ ...prev, main_photo: error }));
                    }}
                    type="main_photo"
                    currentImage={imagePreview.main_photo}
                    className="upload-button"
                    restaurantId={restaurant.id}
                    axiosInstance={restaurantAxios}
                  />
                </div>
                {errors.main_photo && <span className="error-message">{errors.main_photo}</span>}
              </div>

              <div className="image-upload-group">
                <label>Logo</label>
                <div className="image-upload-area">
                  {imagePreview.logo ? (
                    <img 
                      src={imagePreview.logo} 
                      alt="Logo" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <FaImage />
                      <span>Nenhum logo</span>
                    </div>
                  )}
                  
                  <ImageUpload
                    onUploadSuccess={(imageUrl) => {
                      setImagePreview(prev => ({ ...prev, logo: imageUrl }));
                      setImages(prev => ({ ...prev, logo: imageUrl }));
                    }}
                    onUploadError={(error) => {
                      setErrors(prev => ({ ...prev, logo: error }));
                    }}
                    type="logo"
                    currentImage={imagePreview.logo}
                    className="upload-button"
                    restaurantId={restaurant.id}
                    axiosInstance={restaurantAxios}
                  />
                </div>
                {errors.logo && <span className="error-message">{errors.logo}</span>}
              </div>
            </div>
          </div>

          {/* Erro Geral */}
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              <FaTimes />
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <FaSave />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRestaurantModal;
