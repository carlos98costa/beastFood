import { useState, useCallback } from 'react';
import cameraService from '../services/cameraService';

const useCamera = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  const {
    quality = 0.8,
    allowsEditing = true,
    aspect = [1, 1],
    maxImages = 10,
    autoResize = true,
    resizeOptions = { width: 800, height: 800 }
  } = options;

  // Capturar foto com a câmera
  const capturePhoto = useCallback(async (customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalOptions = {
        quality,
        allowsEditing,
        aspect,
        ...customOptions
      };
      
      const result = await cameraService.capturePhoto(finalOptions);
      
      if (result) {
        let processedImage = result;
        
        // Redimensionar automaticamente se habilitado
        if (autoResize) {
          try {
            const resized = await cameraService.resizeImage(result.uri, {
              resize: resizeOptions,
              compress: quality
            });
            processedImage = { ...result, ...resized };
          } catch (resizeError) {
            console.warn('Erro ao redimensionar imagem:', resizeError);
            // Continua com a imagem original se o redimensionamento falhar
          }
        }
        
        setCurrentImage(processedImage);
        return processedImage;
      }
      
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quality, allowsEditing, aspect, autoResize, resizeOptions]);

  // Selecionar imagem da galeria
  const pickFromGallery = useCallback(async (customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalOptions = {
        quality,
        allowsEditing,
        aspect,
        ...customOptions
      };
      
      const result = await cameraService.pickImageFromGallery(finalOptions);
      
      if (result) {
        let processedImage = result;
        
        // Redimensionar automaticamente se habilitado
        if (autoResize) {
          try {
            const resized = await cameraService.resizeImage(result.uri, {
              resize: resizeOptions,
              compress: quality
            });
            processedImage = { ...result, ...resized };
          } catch (resizeError) {
            console.warn('Erro ao redimensionar imagem:', resizeError);
            // Continua com a imagem original se o redimensionamento falhar
          }
        }
        
        setCurrentImage(processedImage);
        return processedImage;
      }
      
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quality, allowsEditing, aspect, autoResize, resizeOptions]);

  // Selecionar múltiplas imagens
  const pickMultipleImages = useCallback(async (customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalOptions = {
        quality,
        limit: maxImages,
        ...customOptions
      };
      
      const results = await cameraService.pickMultipleImages(finalOptions);
      
      if (results && results.length > 0) {
        let processedImages = results;
        
        // Redimensionar automaticamente se habilitado
        if (autoResize) {
          try {
            processedImages = await Promise.all(
              results.map(async (image) => {
                try {
                  const resized = await cameraService.resizeImage(image.uri, {
                    resize: resizeOptions,
                    compress: quality
                  });
                  return { ...image, ...resized };
                } catch (resizeError) {
                  console.warn('Erro ao redimensionar imagem:', resizeError);
                  return image; // Retorna a imagem original se o redimensionamento falhar
                }
              })
            );
          } catch (error) {
            console.warn('Erro ao processar múltiplas imagens:', error);
            // Continua com as imagens originais
          }
        }
        
        setImages(processedImages);
        return processedImages;
      }
      
      return [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quality, maxImages, autoResize, resizeOptions]);

  // Mostrar opções de seleção
  const showImagePicker = useCallback(async (customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalOptions = {
        quality,
        allowsEditing,
        aspect,
        ...customOptions
      };
      
      const result = await cameraService.showImagePickerOptions(finalOptions);
      
      if (result) {
        let processedImage = result;
        
        // Redimensionar automaticamente se habilitado
        if (autoResize) {
          try {
            const resized = await cameraService.resizeImage(result.uri, {
              resize: resizeOptions,
              compress: quality
            });
            processedImage = { ...result, ...resized };
          } catch (resizeError) {
            console.warn('Erro ao redimensionar imagem:', resizeError);
            // Continua com a imagem original se o redimensionamento falhar
          }
        }
        
        setCurrentImage(processedImage);
        return processedImage;
      }
      
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quality, allowsEditing, aspect, autoResize, resizeOptions]);

  // Salvar imagem na galeria
  const saveToGallery = useCallback(async (imageUri, albumName) => {
    try {
      setLoading(true);
      setError(null);
      
      const uri = imageUri || currentImage?.uri;
      if (!uri) {
        throw new Error('Nenhuma imagem para salvar');
      }
      
      const success = await cameraService.saveToGallery(uri, albumName);
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentImage]);

  // Redimensionar imagem
  const resizeImage = useCallback(async (imageUri, resizeOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const uri = imageUri || currentImage?.uri;
      if (!uri) {
        throw new Error('Nenhuma imagem para redimensionar');
      }
      
      const result = await cameraService.resizeImage(uri, resizeOptions);
      
      // Atualizar imagem atual se foi ela que foi redimensionada
      if (!imageUri && currentImage) {
        setCurrentImage({ ...currentImage, ...result });
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentImage]);

  // Preparar imagem para upload
  const prepareForUpload = useCallback(async (image, uploadOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const targetImage = image || currentImage;
      if (!targetImage) {
        throw new Error('Nenhuma imagem para preparar');
      }
      
      const formData = await cameraService.prepareImageForUpload(targetImage, uploadOptions);
      return formData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentImage]);

  // Validar imagem
  const validateImage = useCallback((image, validationOptions = {}) => {
    try {
      const targetImage = image || currentImage;
      if (!targetImage) {
        throw new Error('Nenhuma imagem para validar');
      }
      
      return cameraService.validateImage(targetImage, validationOptions);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentImage]);

  // Converter para base64
  const toBase64 = useCallback(async (imageUri) => {
    try {
      setLoading(true);
      setError(null);
      
      const uri = imageUri || currentImage?.uri;
      if (!uri) {
        throw new Error('Nenhuma imagem para converter');
      }
      
      const base64 = await cameraService.imageToBase64(uri);
      return base64;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentImage]);

  // Adicionar imagem à lista
  const addImage = useCallback((image) => {
    setImages(prev => {
      const newImages = [...prev, image];
      return newImages.slice(-maxImages); // Manter apenas as últimas imagens
    });
  }, [maxImages]);

  // Remover imagem da lista
  const removeImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Limpar imagens
  const clearImages = useCallback(() => {
    setImages([]);
    setCurrentImage(null);
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    images,
    currentImage,
    
    // Ações principais
    capturePhoto,
    pickFromGallery,
    pickMultipleImages,
    showImagePicker,
    
    // Utilitários
    saveToGallery,
    resizeImage,
    prepareForUpload,
    validateImage,
    toBase64,
    
    // Gerenciamento de lista
    addImage,
    removeImage,
    clearImages,
    clearError,
    
    // Estado computado
    hasImages: images.length > 0,
    hasCurrentImage: !!currentImage,
    imageCount: images.length,
    canAddMore: images.length < maxImages
  };
};

export default useCamera;