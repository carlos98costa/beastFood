// Exportar tema e estilos globais
export { default as theme } from './theme';
export { default as globalStyles } from './globalStyles';

// Re-exportar individualmente para garantir compatibilidade
import theme from './theme';
export const { colors, typography, spacing, borderRadius, shadows, screen, layout, animations } = theme;

// Garantir que as variáveis estejam disponíveis para os utilitários
const { colors: themeColors, screen: themeScreen } = theme;

// Utilitários de estilo
export const createStyles = (styleFunction) => {
  return styleFunction(theme);
};

// Hook para usar o tema (se você quiser implementar um sistema de temas dinâmicos no futuro)
export const useTheme = () => {
  return theme;
};

// Utilitários para responsividade
export const responsive = {
  // Função para obter estilos baseados no tamanho da tela
  getStyleForScreen: (styles) => {
    if (themeScreen?.isSmall) {
      return styles.small || styles.default;
    } else if (themeScreen?.isMedium) {
      return styles.medium || styles.default;
    } else {
      return styles.large || styles.default;
    }
  },
  
  // Função para obter valores baseados no tamanho da tela
  getValue: (values) => {
    if (themeScreen?.isSmall) {
      return values.small !== undefined ? values.small : values.default;
    } else if (themeScreen?.isMedium) {
      return values.medium !== undefined ? values.medium : values.default;
    } else {
      return values.large !== undefined ? values.large : values.default;
    }
  },
};

// Utilitários para cores
export const colorUtils = {
  // Função para obter cor com opacidade
  withOpacity: (color, opacity) => {
    // Se a cor já tem opacidade (rgba), substitui
    if (color.includes('rgba')) {
      return color.replace(/[\d\.]+\)$/g, `${opacity})`);
    }
    
    // Se é hex, converte para rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Se é rgb, converte para rgba
    if (color.includes('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    return color;
  },
  
  // Função para obter cor de status
  getStatusColor: (status) => {
    switch (status) {
      case 'success':
        return themeColors?.success?.[500] || '#22c55e';
      case 'warning':
        return themeColors?.warning?.[500] || '#f59e0b';
      case 'error':
        return themeColors?.error?.[500] || '#ef4444';
      case 'info':
        return themeColors?.info?.[500] || '#3b82f6';
      default:
        return themeColors?.gray?.[500] || '#6b7280';
    }
  },
};

// Utilitários para sombras
export const shadowUtils = {
  // Função para criar sombra customizada
  createShadow: (elevation, color = themeColors?.black || '#000000', opacity = 0.1) => {
    return {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: elevation / 2,
      },
      shadowOpacity: opacity,
      shadowRadius: elevation,
      elevation: elevation,
    };
  },
};