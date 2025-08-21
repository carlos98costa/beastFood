import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Modal = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'slide',
  style,
  contentStyle,
  ...props
}) => {
  const getModalStyle = () => {
    const baseStyle = [styles.modal];
    
    if (position === 'bottom') {
      baseStyle.push(styles.bottomModal);
    } else if (position === 'top') {
      baseStyle.push(styles.topModal);
    } else {
      baseStyle.push(styles.centerModal);
    }
    
    if (size === 'small') {
      baseStyle.push(styles.smallModal);
    } else if (size === 'large') {
      baseStyle.push(styles.largeModal);
    } else if (size === 'fullscreen') {
      baseStyle.push(styles.fullscreenModal);
    } else {
      baseStyle.push(styles.mediumModal);
    }
    
    return baseStyle;
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      {...props}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeOnBackdrop ? onClose : undefined}
        >
          <TouchableOpacity
            style={[getModalStyle(), style]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {showCloseButton && (
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            <ScrollView 
              style={[styles.content, contentStyle]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

// Modal de confirmação
const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  cancelVariant = 'outline',
  ...props
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="small"
      closeOnBackdrop={false}
      {...props}
    >
      <View style={styles.confirmContent}>
        <Text style={styles.confirmMessage}>{message}</Text>
        
        <View style={styles.confirmActions}>
          <Button
            title={cancelText}
            variant={cancelVariant}
            onPress={onClose}
            style={styles.confirmButton}
          />
          <Button
            title={confirmText}
            variant={confirmVariant}
            onPress={onConfirm}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  );
};

// Modal de alerta
const AlertModal = ({
  visible,
  onClose,
  title = 'Aviso',
  message,
  buttonText = 'OK',
  icon,
  iconColor = '#ef4444',
  ...props
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="small"
      showCloseButton={false}
      {...props}
    >
      <View style={styles.alertContent}>
        {icon && (
          <View style={styles.alertIcon}>
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>
        )}
        
        <Text style={styles.alertMessage}>{message}</Text>
        
        <Button
          title={buttonText}
          variant="primary"
          onPress={onClose}
          style={styles.alertButton}
        />
      </View>
    </Modal>
  );
};

// Modal de loading
const LoadingModal = ({
  visible,
  message = 'Carregando...',
  ...props
}) => {
  return (
    <Modal
      visible={visible}
      size="small"
      showCloseButton={false}
      closeOnBackdrop={false}
      {...props}
    >
      <View style={styles.loadingContent}>
        <View style={styles.loadingSpinner}>
          {/* Aqui você pode adicionar um spinner customizado */}
          <Text style={styles.loadingText}>⏳</Text>
        </View>
        <Text style={styles.loadingMessage}>{message}</Text>
      </View>
    </Modal>
  );
};

// Modal de seleção
const SelectModal = ({
  visible,
  onClose,
  onSelect,
  title = 'Selecionar',
  options = [],
  selectedValue,
  ...props
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      position="bottom"
      {...props}
    >
      <View style={styles.selectContent}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.value || index}
            style={[
              styles.selectOption,
              selectedValue === option.value && styles.selectedOption,
            ]}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            <Text style={[
              styles.selectOptionText,
              selectedValue === option.value && styles.selectedOptionText,
            ]}>
              {option.label}
            </Text>
            {selectedValue === option.value && (
              <Ionicons name="checkmark" size={20} color="#ef4444" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: screenHeight * 0.9,
  },
  
  // Positions
  centerModal: {
    margin: 20,
  },
  bottomModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  // Sizes
  smallModal: {
    width: screenWidth * 0.8,
    maxWidth: 320,
  },
  mediumModal: {
    width: screenWidth * 0.9,
    maxWidth: 480,
  },
  largeModal: {
    width: screenWidth * 0.95,
    maxWidth: 600,
  },
  fullscreenModal: {
    width: screenWidth,
    height: screenHeight,
    borderRadius: 0,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  
  // Content
  content: {
    padding: 20,
  },
  
  // Confirm Modal
  confirmContent: {
    alignItems: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  
  // Alert Modal
  alertContent: {
    alignItems: 'center',
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  alertButton: {
    width: '100%',
  },
  
  // Loading Modal
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 32,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  
  // Select Modal
  selectContent: {
    paddingVertical: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedOption: {
    backgroundColor: '#fef2f2',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});

// Exportar componentes
Modal.Confirm = ConfirmModal;
Modal.Alert = AlertModal;
Modal.Loading = LoadingModal;
Modal.Select = SelectModal;

export default Modal;
export { ConfirmModal, AlertModal, LoadingModal, SelectModal };