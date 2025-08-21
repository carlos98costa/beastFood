import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Input = forwardRef(({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  required = false,
  style,
  inputStyle,
  containerStyle,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (variant === 'outlined') {
      baseStyle.push(styles.outlinedContainer);
    } else if (variant === 'filled') {
      baseStyle.push(styles.filledContainer);
    } else {
      baseStyle.push(styles.defaultContainer);
    }
    
    if (isFocused) {
      baseStyle.push(styles.focusedContainer);
    }
    
    if (error) {
      baseStyle.push(styles.errorContainer);
    }
    
    if (!editable) {
      baseStyle.push(styles.disabledContainer);
    }
    
    return baseStyle;
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (size === 'small') {
      baseStyle.push(styles.smallInput);
    } else if (size === 'large') {
      baseStyle.push(styles.largeInput);
    } else {
      baseStyle.push(styles.mediumInput);
    }
    
    if (leftIcon) {
      baseStyle.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon || secureTextEntry) {
      baseStyle.push(styles.inputWithRightIcon);
    }
    
    if (multiline) {
      baseStyle.push(styles.multilineInput);
    }
    
    return baseStyle;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>
      );
    }
    
    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightIconPress}
        >
          <Ionicons name={rightIcon} size={20} color="#64748b" />
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[getContainerStyle(), style]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={20} color="#64748b" />
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {(error || helperText) && (
        <View style={styles.helperContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!error && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
      )}
      
      {maxLength && (
        <Text style={styles.characterCount}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
});

// Input de busca especializado
const SearchInput = ({
  placeholder = 'Buscar...',
  onSearch,
  onClear,
  showClearButton = true,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (text) => {
    setSearchValue(text);
    onSearch?.(text);
  };

  const handleClear = () => {
    setSearchValue('');
    onClear?.();
    onSearch?.('');
  };

  return (
    <Input
      placeholder={placeholder}
      value={searchValue}
      onChangeText={handleSearch}
      leftIcon="search"
      rightIcon={searchValue && showClearButton ? 'close' : undefined}
      onRightIconPress={handleClear}
      variant="outlined"
      {...props}
    />
  );
};

// Input de avaliação (estrelas)
const RatingInput = ({
  rating = 0,
  onRatingChange,
  maxRating = 5,
  size = 24,
  color = '#fbbf24',
  emptyColor = '#d1d5db',
  disabled = false,
  style,
}) => {
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !disabled && onRatingChange?.(i)}
          disabled={disabled}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={size}
            color={i <= rating ? color : emptyColor}
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  return (
    <View style={[styles.ratingContainer, style]}>
      {renderStars()}
    </View>
  );
};

// Input de seleção de data
const DateInput = ({
  label,
  value,
  onDateChange,
  placeholder = 'Selecionar data',
  format = 'DD/MM/YYYY',
  minDate,
  maxDate,
  error,
  ...props
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  return (
    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
      <Input
        label={label}
        placeholder={placeholder}
        value={formatDate(value)}
        editable={false}
        rightIcon="calendar"
        error={error}
        {...props}
      />
      {/* Aqui você pode integrar com um date picker como @react-native-community/datetimepicker */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  
  // Container styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  defaultContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  outlinedContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filledContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedContainer: {
    borderColor: '#ef4444',
  },
  errorContainer: {
    borderColor: '#ef4444',
  },
  disabledContainer: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  
  // Input styles
  input: {
    flex: 1,
    color: '#1f2937',
    fontSize: 16,
  },
  smallInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  mediumInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  largeInput: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  // Icon styles
  leftIconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  
  // Helper text styles
  helperContainer: {
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Rating styles
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
});

// Exportar componentes
Input.Search = SearchInput;
Input.Rating = RatingInput;
Input.Date = DateInput;

export default Input;
export { SearchInput, RatingInput, DateInput };