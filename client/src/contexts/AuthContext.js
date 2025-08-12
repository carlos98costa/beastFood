import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configurar URL base do axios
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true; // Importante para enviar cookies
console.log('Axios configurado com baseURL:', axios.defaults.baseURL);

// Interceptor para renovar token automaticamente em caso de erro 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Token expirado, tentando renovar...');
        const response = await axios.post('/api/auth/refresh');
        const { accessToken } = response.data;
        
        // Atualizar token no contexto e localStorage
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Reenviar a requisição original com o novo token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Falha na renovação do token:', refreshError);
        
        // Se falhar na renovação, limpar dados e redirecionar para login
        if (refreshError.response?.status === 401) {
          localStorage.removeItem('token');
          // Não usar window.location.href aqui para evitar problemas de navegação
          // Em vez disso, disparar um evento customizado
          window.dispatchEvent(new CustomEvent('tokenExpired'));
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Listener para token expirado
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Evento tokenExpired recebido, fazendo logout');
      logout();
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  // Configurar axios com token
  useEffect(() => {
    console.log('useEffect token mudou:', token);
    console.log('Tipo do token:', typeof token);
    console.log('Token é truthy:', !!token);
    
    if (token) {
      console.log('Configurando axios com token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      console.log('Sem token, definindo loading como false');
      setLoading(false);
    }
  }, [token]);

  // Verificar e renovar token automaticamente
  useEffect(() => {
    if (token) {
      // Verificar se o token está próximo de expirar (5 minutos antes)
      const checkTokenExpiration = () => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000; // Converter para milissegundos
          const currentTime = Date.now();
          const timeUntilExpiration = expirationTime - currentTime;
          
          // Se faltar menos de 5 minutos para expirar, renovar
          if (timeUntilExpiration < 5 * 60 * 1000) {
            console.log('Token próximo de expirar, renovando...');
            checkAndRefreshToken();
          } else {
            console.log(`Token válido por mais ${Math.round(timeUntilExpiration / 60000)} minutos`);
          }
        } catch (error) {
          console.error('Erro ao verificar expiração do token:', error);
          // Se não conseguir decodificar o token, tentar renovar
          checkAndRefreshToken();
        }
      };

      // Verificar imediatamente
      checkTokenExpiration();
      
      // Verificar a cada 2 minutos
      const tokenCheckInterval = setInterval(checkTokenExpiration, 2 * 60 * 1000);

      return () => clearInterval(tokenCheckInterval);
    }
  }, [token]);

  const checkAndRefreshToken = async () => {
    try {
      console.log('Verificando se token precisa ser renovado...');
      
      // Verificar se o token está próximo de expirar (5 minutos antes)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Se faltar menos de 5 minutos para expirar, renovar
      if (timeUntilExpiration < 5 * 60 * 1000) {
        console.log('Token próximo de expirar, renovando...');
        
        const response = await axios.post('/api/auth/refresh');
        const { accessToken } = response.data;
        
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        console.log('Token renovado automaticamente');
        
        // Atualizar o estado do usuário se necessário
        if (!user) {
          try {
            const verifyResponse = await axios.get('/api/auth/verify');
            setUser(verifyResponse.data.user);
            console.log('Usuário atualizado após renovação');
          } catch (verifyError) {
            console.error('Erro ao verificar usuário após renovação:', verifyError);
          }
        }
      } else {
        console.log(`Token ainda válido por mais ${Math.round(timeUntilExpiration / 60000)} minutos`);
      }
    } catch (error) {
      console.log('Falha na renovação automática do token:', error.message);
      // Se falhar, não fazer logout imediatamente, apenas logar o erro
      // Pode ser erro temporário de rede
    }
  };

  const verifyToken = async () => {
    try {
      console.log('Verificando token:', token);
      const response = await axios.get('/api/auth/verify');
      console.log('Token válido, usuário:', response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error('Token inválido, tentando renovar:', error);
      
      // Se a verificação falhar, tentar renovar o token
      try {
        console.log('Tentando renovar token...');
        const refreshResponse = await axios.post('/api/auth/refresh');
        const { accessToken } = refreshResponse.data;
        
        console.log('Token renovado com sucesso');
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Tentar verificar novamente com o novo token
        const verifyResponse = await axios.get('/api/auth/verify');
        setUser(verifyResponse.data.user);
        console.log('Token renovado e verificado com sucesso');
      } catch (refreshError) {
        console.error('Falha na renovação do token:', refreshError);
        // Só fazer logout se realmente não conseguir renovar
        if (refreshError.response?.status === 401) {
          console.log('Refresh token expirado, fazendo logout');
          logout();
        } else {
          console.log('Erro temporário na renovação, mantendo usuário logado');
          // Não fazer logout imediatamente, pode ser erro temporário
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Tentando login com:', { username, password: '***' });
      const response = await axios.post('/api/auth/login', { username, password });
      console.log('Resposta do login:', response.data);
      const { user, accessToken } = response.data;
      
      console.log('Token extraído:', accessToken ? `${accessToken.substring(0, 20)}...` : 'undefined');
      console.log('Tipo do token:', typeof accessToken);
      
      setUser(user);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log('Login bem-sucedido, usuário definido:', user);
      console.log('Token definido:', accessToken ? 'Sim' : 'Não');
      console.log('Token no localStorage:', localStorage.getItem('token') ? 'Sim' : 'Não');
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Tentando registro com:', { ...userData, password: '***' });
      const response = await axios.post('/api/auth/register', userData);
      console.log('Resposta do registro:', response.data);
      const { user, accessToken } = response.data;
      
      setUser(user);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log('Registro bem-sucedido, usuário definido:', user);
      console.log('Token definido:', accessToken ? 'Sim' : 'Não');
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no registro' 
      };
    }
  };

  const logout = () => {
    console.log('Fazendo logout');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    console.log('Logout concluído');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar perfil' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
