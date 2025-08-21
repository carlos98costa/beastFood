import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const PostPhotoGallery = ({ photos, style, onPhotoPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;

  // Mover o panResponder para fora da condição para evitar erro de Hooks
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        if (Math.abs(gesture.dx) > screenWidth * 0.3) {
          if (gesture.dx > 0 && currentIndex > 0) {
            // Swipe para direita - foto anterior
            goToPreviousPhoto();
          } else if (gesture.dx < 0 && currentIndex < photos.length - 1) {
            // Swipe para esquerda - próxima foto
            goToNextPhoto();
          }
        }
        
        // Resetar posição
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const goToNextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPreviousPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPhoto = (index) => {
    setCurrentIndex(index);
  };

  const handlePhotoPress = () => {
    if (onPhotoPress) {
      onPhotoPress(photos, currentIndex);
    }
  };

  // Se houver apenas uma foto, exibir sem controles de navegação
  if (photos.length === 1) {
    return (
      <TouchableOpacity onPress={handlePhotoPress} activeOpacity={0.9}>
        <Image
          source={{ uri: photos[0] }}
          style={[styles.singlePhoto, style]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Foto atual com gestos de swipe */}
      <Animated.View
        style={[
          styles.photoContainer,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={handlePhotoPress} activeOpacity={0.9}>
          <Image
            source={{ uri: photos[currentIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Indicadores de navegação */}
      <View style={styles.navigationContainer}>
        {/* Botão anterior - SEMPRE à esquerda */}
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.prevButton,
            currentIndex === 0 && styles.disabledButton
          ]}
          onPress={goToPreviousPhoto}
          activeOpacity={0.7}
          disabled={currentIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "#fff"} 
          />
        </TouchableOpacity>

        {/* Botão próximo - SEMPRE à direita */}
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton,
            currentIndex === photos.length - 1 && styles.disabledButton
          ]}
          onPress={goToNextPhoto}
          activeOpacity={0.7}
          disabled={currentIndex === photos.length - 1}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={currentIndex === photos.length - 1 ? "rgba(255,255,255,0.3)" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      {/* Indicadores de pontos */}
      <View style={styles.dotsContainer}>
        {photos.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
            onPress={() => goToPhoto(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>

      {/* Contador de fotos */}
      <View style={styles.photoCounter}>
        <Text style={styles.photoCounterText}>
          {currentIndex + 1} de {photos.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoContainer: {
    width: '100%',
    height: 200,
  },
  photo: {
    width: '100%',
    height: 200,
  },
  singlePhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    pointerEvents: 'box-none',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    marginLeft: 10,
  },
  nextButton: {
    marginRight: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  photoCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default PostPhotoGallery;
