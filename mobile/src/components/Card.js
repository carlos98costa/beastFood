import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SERVER_BASE_URL } from '../utils/api';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';
import { Ionicons } from '@expo/vector-icons';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  shadow = true,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    shadow && styles.shadow,
    styles[variant],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

// Componente específico para restaurantes
const RestaurantCard = ({
  restaurant,
  onPress,
  style,
}) => {
  const imageUri = getSafeImageUri(restaurant.image_url, PLACEHOLDERS.RESTAURANT_LARGE);
  
  return (
    <Card onPress={onPress} style={[styles.restaurantCard, style]}>
      <Image 
        source={{ uri: imageUri }} 
        style={styles.restaurantImage}
      />
      
      <View style={[styles.statusBadge, { backgroundColor: restaurant.is_open ? '#10b981' : '#ef4444' }]}>
        <Text style={styles.statusText}>{restaurant.is_open ? 'Aberto' : 'Fechado'}</Text>
      </View>
      
      <View style={styles.restaurantContent}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type || 'Não informado'}</Text>
            <Text style={styles.restaurantPrice}>{restaurant.price_range || '$'}</Text>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(restaurant.average_rating || 0) ? "star" : "star-outline"}
                size={14}
                color={index < Math.floor(restaurant.average_rating || 0) ? "#fbbf24" : "#d1d5db"}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{restaurant.average_rating || 0}</Text>
          <Text style={styles.reviewCount}>({restaurant.review_count || 0} avaliações)</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {restaurant.address || 'Endereço não informado'}
          </Text>
        </View>
        
        {restaurant.distance && (
          <Text style={styles.restaurantDistance}>{restaurant.distance}</Text>
        )}
      </View>
    </Card>
  );
};

// Componente específico para posts
const PostCard = ({
  post,
  onPress,
  onUserPress,
  onRestaurantPress,
  onLike,
  onComment,
  style,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card onPress={onPress} style={[styles.postCard, style]}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onUserPress && onUserPress(post.user?.id)}
        >
          <Image 
            source={{ uri: getSafeImageUri(post.user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }} 
            style={styles.userAvatar} 
          />
          <View>
            <Text style={styles.userName}>{post.user?.name || 'Usuário'}</Text>
            <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {post.restaurant && (
        <TouchableOpacity 
          style={styles.restaurantInfo}
          onPress={() => onRestaurantPress && onRestaurantPress(post.restaurant.id)}
        >
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.restaurantName}>{post.restaurant.name}</Text>
          {post.restaurant.location && (
            <Text style={styles.restaurantLocation}> • {post.restaurant.location}</Text>
          )}
        </TouchableOpacity>
      )}
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.images && post.images.length > 0 && typeof post.images[0] === 'string' && (
        <Image 
          source={{ uri: post.images[0] }} 
          style={styles.postImage} 
        />
      )}
      
      {post.rating && (
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < Math.floor(post.rating) ? "star" : "star-outline"}
              size={16}
              color={index < Math.floor(post.rating) ? "#fbbf24" : "#d1d5db"}
            />
          ))}
          <Text style={styles.ratingText}>({post.rating})</Text>
        </View>
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike && onLike(post.id)}
        >
          <Ionicons 
            name={post.liked ? "heart" : "heart-outline"} 
            size={20} 
            color={post.liked ? "#ef4444" : "#64748b"} 
          />
          <Text style={styles.actionText}>{post.likes_count || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onComment && onComment(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  default: {},
  elevated: {
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  
  // Restaurant Card Styles
  restaurantCard: {
    padding: 0,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantContent: {
    padding: 16,
  },
  restaurantHeader: {
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  restaurantPrice: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#64748b',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
    flex: 1,
  },
  restaurantDistance: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'right',
  },
  
  // Post Card Styles
  postCard: {},
  postHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
});

// Exportar componentes
Card.Restaurant = RestaurantCard;
Card.Post = PostCard;

export default Card;
export { RestaurantCard, PostCard };