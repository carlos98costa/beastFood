import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { PLACEHOLDERS } from '../utils/placeholders';

const SafeImage = ({ 
  source, 
  style, 
  fallbackSource = PLACEHOLDERS.RESTAURANT_BANNER,
  onError,
  onLoad,
  resizeMode = "cover",
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (error) => {
    console.log('🔄 SafeImage: Erro ao carregar imagem, usando fallback');
    setHasError(true);
    setIsLoading(false);
    
    if (onError) {
      onError(error);
    }
  };

  const handleLoad = () => {
    console.log('✅ SafeImage: Imagem carregada com sucesso');
    setHasError(false);
    setIsLoading(false);
    
    if (onLoad) {
      onLoad();
    }
  };

  // Se houve erro, usar fallback
  if (hasError) {
    return (
      <View style={[style, styles.fallbackContainer]}>
        <Image
          source={{ uri: fallbackSource }}
          style={[style, styles.fallbackImage]}
          resizeMode={resizeMode}
          onError={() => console.log('❌ SafeImage: Fallback também falhou')}
          {...props}
        />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
      onLoad={handleLoad}
      fadeDuration={0}
      progressiveRenderingEnabled={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImage: {
    opacity: 0.8,
  },
});

export default SafeImage;
