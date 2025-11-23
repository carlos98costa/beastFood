// Utility functions for generating placeholder images
import { SERVER_BASE_URL } from './api';

/**
 * Generates a data URI for a placeholder image with specified dimensions and text
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} text - Text to display in the placeholder
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Data URI for the placeholder image
 */
export const generatePlaceholder = (width = 100, height = 100, text = '?', bgColor = 'e2e8f0', textColor = '64748b') => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${bgColor}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.3}" fill="#${textColor}" text-anchor="middle" dy=".3em">${text}</text></svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Common placeholder images - Versão compatível com React Native
 */
const createSimplePlaceholder = (width, height, bgColor, textColor, text) => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bgColor}"/><text x="50%" y="50%" font-family="Arial,sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PLACEHOLDERS = {
  USER_AVATAR: createSimplePlaceholder(100, 100, '#f1f5f9', '#64748b', 'User'),
  RESTAURANT_SMALL: createSimplePlaceholder(20, 20, '#fef2f2', '#dc2626', 'R'),
  RESTAURANT_MEDIUM: createSimplePlaceholder(80, 80, '#fef2f2', '#dc2626', 'R'),
  RESTAURANT_LARGE: createSimplePlaceholder(300, 200, '#fef2f2', '#dc2626', 'Restaurant'),
  RESTAURANT_BANNER: createSimplePlaceholder(400, 200, '#ff6b6b', '#ffffff', 'RESTAURANTE'),
  RESTAURANT_DETAIL: createSimplePlaceholder(250, 150, '#fef2f2', '#dc2626', 'Foto'),
  POST_IMAGE: createSimplePlaceholder(300, 200, '#f8fafc', '#64748b', 'Foto'),
};

// Placeholder simples para debug - URL externa que funciona no React Native
export const SIMPLE_PLACEHOLDER = 'https://via.placeholder.com/600x200/cccccc/666666?text=Teste+Imagem';

/**
 * Gets a safe image URI, falling back to placeholder if the original is invalid
 * @param {string} imageUrl - Original image URL
 * @param {string} placeholder - Placeholder to use as fallback
 * @returns {string} Safe image URI
 */
export const getSafeImageUri = (imageUrl, fallbackPlaceholder) => {
  console.log('🔍 getSafeImageUri chamada com:', {
    imageUrl: imageUrl,
    tipoImageUrl: typeof imageUrl,
    tamanhoImageUrl: imageUrl?.length || 0,
    fallbackPlaceholder: fallbackPlaceholder
  });

  // Se não há URL, usar placeholder
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('🔄 Usando placeholder: URL vazia ou nula');
    return fallbackPlaceholder;
  }

  // Se já é uma imagem base64 válida, usar diretamente
  if (imageUrl.startsWith('data:image/')) {
    console.log('✅ Imagem base64 válida detectada');
    console.log('📏 Tamanho da string base64:', imageUrl.length);
    console.log('🔤 Primeiros 100 caracteres:', imageUrl.substring(0, 100));
    
    // Verificar se a string base64 é válida
    try {
      // Tentar decodificar para verificar se é válida
      if (imageUrl.includes('base64,')) {
        const base64Data = imageUrl.split('base64,')[1];
        if (base64Data && base64Data.length > 0) {
          console.log('✅ Base64 válido, retornando imagem');
          return imageUrl;
        }
      }
      console.log('⚠️ Base64 inválido, usando placeholder');
      return fallbackPlaceholder;
    } catch (error) {
      console.log('❌ Erro ao validar base64:', error.message);
      return fallbackPlaceholder;
    }
  }

  // Se é uma URL HTTP/HTTPS válida, usar
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ URL HTTP válida detectada');
    return imageUrl;
  }

  // Se é um arquivo local, usar
  if (imageUrl.startsWith('file://') || imageUrl.startsWith('content://')) {
    console.log('✅ Arquivo local detectado');
    return imageUrl;
  }

  // Para qualquer outro caso, usar placeholder
  console.log('🔄 Usando placeholder: formato não suportado');
  console.log('❌ Tipo de URL não reconhecido:', {
    url: imageUrl,
    tipo: typeof imageUrl,
    primeirosCaracteres: imageUrl.substring(0, 50)
  });
  return fallbackPlaceholder;
};

/**
 * Função para validar e limpar URLs de imagem
 * @param {string} imageUrl - URL da imagem
 * @returns {string} URL limpa e válida
 */
export const cleanImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Remover espaços em branco
  let cleaned = imageUrl.trim();
  
  // Verificar se é base64 válido
  if (cleaned.startsWith('data:image/')) {
    // Garantir que o formato está correto
    if (cleaned.includes('base64,')) {
      return cleaned;
    }
  }
  
  return cleaned;
};