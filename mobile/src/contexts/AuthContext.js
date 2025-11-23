import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../utils/api';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

// Configurar axios para mobile
axios.defaults.baseURL = 'http://186.210.58.15:5000';
axios.defaults.timeout = 10000;

// Necessário para completar sessões de auth no Android/iOS


// Criar o contexto de autenticação
const AuthContext = createContext();

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const isAuthenticated = !!token;

  // Config Google OAuth
  const googleClientIdAndroid = '1061381797582-vhjnn4tqdhhsnnnaj05cu0t7p1n6an0s.apps.googleusercontent.com';

  console.log('🔍 Google OAuth Config:');
  console.log('📍 Client ID:', googleClientIdAndroid);
  console.log('📍 Client ID correto esperado: 1061381797582-vhjnn4tqdhhsnnnaj05cu0t7p1n6an0s.apps.googleusercontent.com');
  console.log('📍 Client IDs são iguais?', googleClientIdAndroid === '1061381797582-vhjnn4tqdhhsnnnaj05cu0t7p1n6an0s.apps.googleusercontent.com');
  console.log('📍 Expo Config Extra:', Constants?.expoConfig?.extra);
  console.log('📍 Package Name:', Constants?.expoConfig?.android?.package);
  console.log('📍 App Name:', Constants?.expoConfig?.name);
  console.log('📍 App Slug:', Constants?.expoConfig?.slug);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleClientIdAndroid,
    scopes: ['openid', 'profile', 'email']
  });

  console.log('🔍 Google Auth Request Config:');
  console.log('📍 Request object:', request);
  console.log('📍 Response object:', response);
  console.log('📍 Redirect URI:', 'https://auth.expo.io/@carlos98costa/beastfood-mobile');

  // Configurar interceptores para axios padrão e para a instância api (usada nas telas)
  useEffect(() => {
    // axios padrão
    const requestInterceptorAxios = axios.interceptors.request.use(
      async (config) => {
        const storedToken = await AsyncStorage.getItem('@beastfood:token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptorAxios = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // instância api
    const requestInterceptorApi = api.interceptors.request.use(
      async (config) => {
        const storedToken = await AsyncStorage.getItem('@beastfood:token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptorApi = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptorAxios);
      axios.interceptors.response.eject(responseInterceptorAxios);
      api.interceptors.request.eject(requestInterceptorApi);
      api.interceptors.response.eject(responseInterceptorApi);
    };
  }, []);

  // Verificar se o usuário está autenticado ao iniciar o app
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setLoading(true);
        const storedUser = await AsyncStorage.getItem('@beastfood:user');
        const storedToken = await AsyncStorage.getItem('@beastfood:token');
        const storedGuestMode = await AsyncStorage.getItem('@beastfood:guestMode');
        
        console.log('AuthContext - storedUser:', !!storedUser, 'storedToken:', !!storedToken, 'storedGuestMode:', storedGuestMode);
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setIsGuestMode(false);
        } else if (storedGuestMode === 'true') {
          console.log('AuthContext - Ativando modo convidado salvo');
          setIsGuestMode(true);
        } else {
          // Se não há usuário autenticado e não há modo convidado salvo, ativar automaticamente
          console.log('AuthContext - Nenhum usuário autenticado, ativando modo convidado automaticamente');
          await AsyncStorage.setItem('@beastfood:guestMode', 'true');
          setIsGuestMode(true);
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
        // Em caso de erro, ativar modo convidado como fallback
        setIsGuestMode(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredData();
  }, []);

  // Efeito para garantir consistência do estado
  useEffect(() => {
    // Se não há usuário nem token, mas o modo convidado não está ativo, ativá-lo
    if (!user && !token && !isGuestMode) {
      console.log('AuthContext - Estado inconsistente detectado, ativando modo convidado');
      setIsGuestMode(true);
    }
  }, [user, token, isGuestMode]);

  // Função para fazer login
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { user: userData, accessToken } = response.data;
      
      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem('@beastfood:user', JSON.stringify(userData));
      await AsyncStorage.setItem('@beastfood:token', accessToken);
      
      // Remover modo convidado ao fazer login
      await AsyncStorage.removeItem('@beastfood:guestMode');
      
      // Atualizar o estado
      setUser(userData);
      setToken(accessToken);
      setIsGuestMode(false); // Desativar modo convidado
      
      console.log('AuthContext - Login bem-sucedido, modo convidado desativado');
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      console.log('🚀 Iniciando login com Google...');
      console.log('📍 Request object disponível:', !!request);
      console.log('📍 PromptAsync disponível:', !!promptAsync);
      console.log('📍 URL de autenticação:', request?.url);
      
      // Dispara o fluxo de autenticação Google
      console.log('📍 Chamando promptAsync...');
      console.log('📍 Aguardando resposta do Google...');
      console.log('📍 Se aparecer uma tela do Google, é sinal de que está funcionando!');
      
      const result = await promptAsync();
      console.log('📍 Resultado do promptAsync:', result);
      console.log('📍 Tipo do resultado:', result?.type);
      console.log('📍 Dados completos:', JSON.stringify(result, null, 2));
      
      if (result?.type !== 'success') {
        console.log('❌ Login cancelado ou falhou:', result?.type);
        if (result?.type === 'dismiss') {
          console.log('❌ Usuário cancelou ou Google rejeitou a requisição');
        }
        return { success: false, error: 'Login com Google cancelado' };
      }

      const accessTokenGoogle = result.authentication?.accessToken;
      console.log('📍 Access Token recebido:', accessTokenGoogle ? '✅ Sim' : '❌ Não');
      console.log('📍 Token parcial:', accessTokenGoogle ? accessTokenGoogle.substring(0, 20) + '...' : 'N/A');
      
      if (!accessTokenGoogle) {
        console.log('❌ Access token do Google não recebido');
        return { success: false, error: 'Access token do Google não recebido' };
      }

      // Trocar pelo JWT do servidor
      console.log('📍 Enviando token para o servidor...');
      console.log('📍 URL da API:', '/api/auth/google-login');
      console.log('📍 Dados enviados:', { accessToken: accessTokenGoogle.substring(0, 20) + '...' });
      
      const resp = await axios.post('/api/auth/google-login', { accessToken: accessTokenGoogle });
      const { user: userData, accessToken } = resp.data;

      await AsyncStorage.setItem('@beastfood:user', JSON.stringify(userData));
      await AsyncStorage.setItem('@beastfood:token', accessToken);

      // Remover modo convidado ao fazer login
      await AsyncStorage.removeItem('@beastfood:guestMode');

      setUser(userData);
      setToken(accessToken);
      setIsGuestMode(false);

      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao autenticar com Google',
      };
    }
  };

  // Função para fazer registro
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { user: newUser, accessToken } = response.data;
      
      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem('@beastfood:user', JSON.stringify(newUser));
      await AsyncStorage.setItem('@beastfood:token', accessToken);
      
      // Remover modo convidado ao fazer registro
      await AsyncStorage.removeItem('@beastfood:guestMode');
      
      // Atualizar o estado
      setUser(newUser);
      setToken(accessToken);
      setIsGuestMode(false); // Desativar modo convidado
      
      console.log('AuthContext - Registro bem-sucedido, modo convidado desativado');
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar conta' 
      };
    }
  };

  // Função para ativar modo convidado
  const enableGuestMode = async () => {
    try {
      console.log('AuthContext - Ativando modo convidado...');
      await AsyncStorage.setItem('@beastfood:guestMode', 'true');
      console.log('AuthContext - Modo convidado salvo no AsyncStorage');
      setIsGuestMode(true);
      console.log('AuthContext - Estado isGuestMode atualizado para true');
    } catch (error) {
      console.error('Erro ao ativar modo convidado:', error);
      setIsGuestMode(true); // Fallback
    }
  };

  // Função para desativar modo convidado
  const disableGuestMode = async () => {
    try {
      await AsyncStorage.removeItem('@beastfood:guestMode');
      setIsGuestMode(false);
    } catch (error) {
      console.error('Erro ao desativar modo convidado:', error);
      setIsGuestMode(false); // Fallback
    }
  };

  // Função para fazer logout
  const logout = async () => {
    try {
      // Remover dados de autenticação
      await AsyncStorage.multiRemove([
        '@beastfood:user',
        '@beastfood:token'
      ]);
      
      // Limpar estado de autenticação
      setUser(null);
      setToken(null);
      
      // Ativar modo convidado automaticamente após logout
      await AsyncStorage.setItem('@beastfood:guestMode', 'true');
      setIsGuestMode(true);
      
      console.log('AuthContext - Logout realizado, modo convidado ativado automaticamente');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: ativar modo convidado mesmo em caso de erro
      setIsGuestMode(true);
    }
  };

  // Valor do contexto
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isGuestMode,
    login,
    register,
    logout,
    loginWithGoogle,
    enableGuestMode,
    disableGuestMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};