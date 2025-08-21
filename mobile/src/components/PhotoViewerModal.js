import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhotoViewerModal = ({ visible, photos, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
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

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (!photos || photos.length === 0) {
    return null;
  }

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

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header com botão de fechar e contador */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {currentIndex + 1} de {photos.length}
              </Text>
            </View>
          </View>

          {/* Container da foto com gestos */}
          <View style={styles.photoContainer}>
            <Animated.View
              style={[
                styles.photoWrapper,
                {
                  transform: [{ translateX: pan.x }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Image
                source={{ uri: photos[currentIndex] }}
                style={styles.photo}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Botões de navegação */}
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
                size={32} 
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
                size={32} 
                color={currentIndex === photos.length - 1 ? "rgba(255,255,255,0.3)" : "#fff"} 
              />
            </TouchableOpacity>
          </View>

          {/* Indicadores de pontos */}
          {photos.length > 1 && (
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
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrapper: {
    width: screenWidth,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: screenWidth,
    height: screenHeight * 0.7,
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
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.3,
  },
});

export default PhotoViewerModal;
