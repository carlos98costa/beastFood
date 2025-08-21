import { useState, useEffect, useRef } from 'react';
import locationService from '../services/locationService';

const useLocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const watchSubscription = useRef(null);

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 10000,
    distanceFilter = 10,
    autoStart = false,
    watchPosition = false
  } = options;

  // Verificar status das permissões
  const checkPermissions = async () => {
    try {
      const status = await locationService.checkLocationPermissions();
      setPermissionStatus(status);
      return status;
    } catch (err) {
      setError(err.message);
      return 'denied';
    }
  };

  // Solicitar permissões
  const requestPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const granted = await locationService.requestLocationPermissions();
      const status = granted ? 'granted' : 'denied';
      setPermissionStatus(status);
      
      return granted;
    } catch (err) {
      setError(err.message);
      setPermissionStatus('denied');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obter localização atual
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const position = await locationService.getCurrentLocation({
        enableHighAccuracy,
        timeout,
        maximumAge
      });
      
      setLocation(position);
      return position;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Iniciar monitoramento de localização
  const startWatching = async () => {
    try {
      if (watchSubscription.current) {
        stopWatching();
      }

      setLoading(true);
      setError(null);
      
      watchSubscription.current = await locationService.watchLocation(
        (position) => {
          setLocation(position);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
          distanceFilter
        }
      );
      
      return watchSubscription.current;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Parar monitoramento de localização
  const stopWatching = () => {
    if (watchSubscription.current) {
      locationService.clearWatch(watchSubscription.current);
      watchSubscription.current = null;
    }
  };

  // Calcular distância para um ponto
  const calculateDistance = (targetLocation) => {
    if (!location || !targetLocation) {
      return null;
    }
    
    return locationService.calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );
  };

  // Formatar distância
  const formatDistance = (targetLocation) => {
    const distance = calculateDistance(targetLocation);
    return distance ? locationService.formatDistance(distance) : null;
  };

  // Geocodificação reversa
  const reverseGeocode = async (coords = null) => {
    try {
      const targetCoords = coords || (location ? location.coords : null);
      
      if (!targetCoords) {
        throw new Error('Coordenadas não disponíveis');
      }
      
      return await locationService.reverseGeocode(
        targetCoords.latitude,
        targetCoords.longitude
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Geocodificação
  const geocode = async (address) => {
    try {
      return await locationService.geocode(address);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Buscar restaurantes próximos
  const findNearbyRestaurants = async (radius = 5000) => {
    try {
      if (!location) {
        throw new Error('Localização não disponível');
      }
      
      return await locationService.getNearbyRestaurants(
        location.coords.latitude,
        location.coords.longitude,
        radius
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  // Efeito para inicialização automática
  useEffect(() => {
    if (autoStart) {
      checkPermissions().then((status) => {
        if (status === 'granted') {
          if (watchPosition) {
            startWatching();
          } else {
            getCurrentLocation();
          }
        }
      });
    }

    return () => {
      stopWatching();
    };
  }, [autoStart, watchPosition]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return {
    // Estado
    location,
    loading,
    error,
    permissionStatus,
    
    // Ações
    checkPermissions,
    requestPermissions,
    getCurrentLocation,
    startWatching,
    stopWatching,
    clearError,
    
    // Utilitários
    calculateDistance,
    formatDistance,
    reverseGeocode,
    geocode,
    findNearbyRestaurants,
    
    // Estado computado
    hasLocation: !!location,
    hasPermission: permissionStatus === 'granted',
    isWatching: !!watchSubscription.current
  };
};

export default useLocation;