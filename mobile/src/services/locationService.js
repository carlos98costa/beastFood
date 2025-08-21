import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
  }

  // Solicitar permissões de localização
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Para encontrar restaurantes próximos, precisamos acessar sua localização.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => Location.openAppSettingsAsync() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões de localização:', error);
      return false;
    }
  }

  // Obter localização atual
  async getCurrentLocation(options = {}) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permissão de localização negada');
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 10000,
        ...options
      };

      const location = await Location.getCurrentPositionAsync(defaultOptions);
      
      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Erro ao obter localização atual:', error);
      throw this.handleLocationError(error);
    }
  }

  // Observar mudanças na localização
  async watchLocation(callback, options = {}) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permissão de localização negada');
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 segundos
        distanceInterval: 100, // 100 metros
        ...options
      };

      this.watchId = await Location.watchPositionAsync(defaultOptions, (location) => {
        const position = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp
        };
        
        this.currentLocation = position;
        callback(position);
      });

      return this.watchId;
    } catch (error) {
      console.error('Erro ao observar localização:', error);
      throw this.handleLocationError(error);
    }
  }

  // Parar de observar localização
  stopWatchingLocation() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Calcular distância entre dois pontos (em metros)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Formatar distância para exibição
  formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  }

  // Obter endereço a partir de coordenadas (geocoding reverso)
  async reverseGeocode(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street,
          streetNumber: address.streetNumber,
          district: address.district,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: this.formatAddress(address)
        };
      }

      return null;
    } catch (error) {
      console.error('Erro no geocoding reverso:', error);
      throw error;
    }
  }

  // Obter coordenadas a partir de endereço (geocoding)
  async geocode(address) {
    try {
      const locations = await Location.geocodeAsync(address);
      
      if (locations.length > 0) {
        return locations.map(location => ({
          latitude: location.latitude,
          longitude: location.longitude
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro no geocoding:', error);
      throw error;
    }
  }

  // Verificar se os serviços de localização estão habilitados
  async isLocationEnabled() {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Erro ao verificar serviços de localização:', error);
      return false;
    }
  }

  // Obter restaurantes próximos (integração com API)
  async getNearbyRestaurants(radius = 5000, limit = 20) {
    try {
      const location = await this.getCurrentLocation();
      
      // Aqui você faria uma chamada para sua API passando as coordenadas
      // Por enquanto, retornamos dados simulados
      const response = await fetch(`/api/restaurants/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar restaurantes próximos');
      }

      const restaurants = await response.json();
      
      // Adicionar distância calculada a cada restaurante
      return restaurants.map(restaurant => ({
        ...restaurant,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          restaurant.latitude,
          restaurant.longitude
        ),
        formattedDistance: this.formatDistance(
          this.calculateDistance(
            location.latitude,
            location.longitude,
            restaurant.latitude,
            restaurant.longitude
          )
        )
      })).sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Erro ao obter restaurantes próximos:', error);
      throw error;
    }
  }

  // Formatar endereço para exibição
  formatAddress(address) {
    const parts = [];
    
    if (address.street && address.streetNumber) {
      parts.push(`${address.street}, ${address.streetNumber}`);
    } else if (address.street) {
      parts.push(address.street);
    }
    
    if (address.district) {
      parts.push(address.district);
    }
    
    if (address.city) {
      parts.push(address.city);
    }
    
    if (address.region) {
      parts.push(address.region);
    }
    
    return parts.join(', ');
  }

  // Tratar erros de localização
  handleLocationError(error) {
    if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
      return new Error('Serviços de localização desabilitados. Ative o GPS nas configurações.');
    } else if (error.code === 'E_LOCATION_TIMEOUT') {
      return new Error('Tempo limite para obter localização. Tente novamente.');
    } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
      return new Error('Localização indisponível. Verifique sua conexão.');
    } else {
      return new Error('Erro ao obter localização. Tente novamente.');
    }
  }

  // Limpar recursos
  cleanup() {
    this.stopWatchingLocation();
    this.currentLocation = null;
  }
}

// Instância singleton
const locationService = new LocationService();

export default locationService;

// Exportar também a classe para casos específicos
export { LocationService };