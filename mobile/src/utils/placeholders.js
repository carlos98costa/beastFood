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
 * Common placeholder images
 */
// Placeholders SVG robustos e compatíveis
const createSimplePlaceholder = (width, height, bgColor, textColor, text) => {
  return `data:image/svg+xml;base64,${btoa(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bgColor}"/><text x="50%" y="50%" font-family="Arial,sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`)}`;
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

// Teste: placeholder simples para debug
export const SIMPLE_PLACEHOLDER = 'https://via.placeholder.com/600x200/cccccc/666666?text=Teste+Imagem';

/**
 * Gets a safe image URI, falling back to placeholder if the original is invalid
 * @param {string} imageUrl - Original image URL
 * @param {string} placeholder - Placeholder to use as fallback
 * @returns {string} Safe image URI
 */
export const getSafeImageUri = (imageUrl, placeholder) => {
  if (!imageUrl) {
    return placeholder;
  }
  
  // Se for uma URL do servidor local, usar diretamente
  if (imageUrl.startsWith('http://') && (imageUrl.includes('localhost') || imageUrl.includes('192.168') || imageUrl.includes('127.0.0.1'))) {
    return imageUrl;
  }
  
  // Se for um caminho relativo, assumir que é do servidor
  if (!imageUrl.startsWith('http')) {
    const fullUrl = `${SERVER_BASE_URL}${imageUrl}`;
    return fullUrl;
  }
  
  // Bloquear URLs externas problemáticas
  if (imageUrl.includes('images.unsplash.com') ||
      imageUrl.includes('randomuser.me')) {
    return placeholder;
  }
  
  // Permitir via.placeholder.com temporariamente para debug
  if (imageUrl.includes('via.placeholder.com')) {
    return imageUrl;
  }
  
  return imageUrl;
};