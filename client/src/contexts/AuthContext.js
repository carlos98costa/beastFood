import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Configurar URL base do axios com otimizações de performance
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true; // Importante para enviar cookies
axios.defaults.timeout = 5000; // Timeout de 5 segundos para ser mais responsivo
// Otimizações adicionais
axios.defaults.maxRedirects = 0; // Sem redirecionamentos
// Tratar 4xx como erro para permitir que o interceptor de 401 execute corretamente
axios.defaults.validateStatus = (status) => status >= 200 && status < 300;

// Interceptor para renovar token automaticamente em caso de erro 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se for rate limiting, não tentar renovar
    if (error.response?.status === 429) {
      console.log('Rate limiting detectado no interceptor, aguardando...');
      // Aguardar 500ms antes de rejeitar (reduzido de 1s)
      await new Promise(resolve => setTimeout(resolve, 500));
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Verificar se há token no localStorage antes de tentar renovar
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        console.log('Sem token para renovar, redirecionando para logout');
        // Disparar evento para fazer logout
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        return Promise.reject(error);
      }
      
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
        
        // Se falhar na renovação, limpar dados e redirecionar para logout
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
  
  // Debug: log do estado inicial
  console.log('AuthProvider - Estado inicial:', { 
    hasToken: !!token, 
    loading, 
    user: !!user 
  });
  
  // Prevenir requisições duplicadas
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Usar useRef para evitar loops infinitos
  const lastRequestTime = useRef(0);
  const verifyTimeout = useRef(null);
  const isInitialized = useRef(false);
  const tokenCheckInterval = useRef(null);

  // Função para logout local (sem dependências circulares)
  const doLocalLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    isInitialized.current = false;
    
    // Limpar intervalos e timeouts
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
    if (verifyTimeout.current) {
      clearTimeout(verifyTimeout.current);
      verifyTimeout.current = null;
    }
  }, []);

  // Funções memoizadas para evitar recriação
  const checkAndRefreshToken = useCallback(async () => {
    if (!user || !token || isRefreshing) return;

    try {
      const response = await axios.post('/api/auth/refresh');
      const { accessToken } = response.data;
      
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log('Token renovado automaticamente');
    } catch (error) {
      console.log('Falha na renovação automática do token:', error.message);
    }
  }, [user, token, isRefreshing]);

  const attemptTokenRefresh = useCallback(async () => {
    if (isRefreshing) {
      console.log('Renovação já em andamento, pulando...');
      return;
    }

    setIsRefreshing(true);

    try {
      console.log('Tentando renovar token...');
      const refreshResponse = await axios.post('/api/auth/refresh');
      const { accessToken } = refreshResponse.data;
      
      console.log('Token renovado com sucesso');
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Verificar com o novo token
      const verifyResponse = await axios.get('/api/auth/verify');
      setUser(verifyResponse.data.user);
      setLoading(false);
      console.log('Token renovado e verificado com sucesso');
    } catch (refreshError) {
      console.error('Falha na renovação do token:', refreshError);
      
      if (refreshError.response?.status === 429) {
        console.log('Rate limiting na renovação, aguardando...');
        setTimeout(() => {
          if (token && !isRefreshing) {
            console.log('Tentando renovar token novamente após rate limiting...');
            attemptTokenRefresh();
          }
        }, 10000); // Reduzido para 10 segundos
        return;
      }
      
      if (refreshError.response?.status === 401) {
        console.log('Refresh token expirado ou invalidado, fazendo logout');
        doLocalLogout();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, token, doLocalLogout]);

  const verifyToken = useCallback(async () => {
    console.log('verifyToken chamada com:', { token: !!token, isVerifying });
    
    if (!token || isVerifying) {
      console.log('verifyToken: pulando verificação - sem token ou já verificando');
      setLoading(false);
      return;
    }

    // Prevenir requisições muito próximas (reduzido para 200ms)
    const now = Date.now();
    if (now - lastRequestTime.current < 200) { // 200ms
      console.log('Requisição muito recente, aguardando...');
      setLoading(false);
      return;
    }

    // Limpar timeout anterior
    if (verifyTimeout.current) {
      clearTimeout(verifyTimeout.current);
    }

    console.log('verifyToken: executando verificação AGORA...');
    
    // SEM debounce - executar imediatamente
    setIsVerifying(true);
    lastRequestTime.current = now;

    try {
      console.log('verifyToken: fazendo requisição para /api/auth/verify...');
      const response = await axios.get('/api/auth/verify');
      console.log('verifyToken: resposta recebida:', response.data);
      setUser(response.data.user);
      setLoading(false);
      console.log('verifyToken: usuário definido e loading false');
    } catch (error) {
      console.error('verifyToken: erro na verificação:', error);
      
      if (error.response?.status === 429) {
        console.log('Rate limiting detectado, aguardando antes de tentar renovar...');
        setLoading(false);
        // Aguardar 3 segundos antes de tentar renovar (reduzido de 5s)
        setTimeout(() => {
          if (token && !isRefreshing) {
            console.log('Tentando renovar token após delay...');
            attemptTokenRefresh();
          }
        }, 3000);
        return;
      }
      
      if (!isRefreshing) {
        console.log('verifyToken: tentando renovar token...');
        attemptTokenRefresh();
      }
      
      // Garantir que loading seja false mesmo em caso de erro
      setLoading(false);
      console.log('verifyToken: loading definido como false após erro');
    } finally {
      setIsVerifying(false);
      // Garantir que loading seja false no finally
      setLoading(false);
      console.log('verifyToken: finally executado, loading false');
    }
  }, [token, isVerifying, isRefreshing, attemptTokenRefresh]);

  const logout = useCallback(async () => {
    try {
      console.log('Fazendo logout no servidor...');
      await axios.post('/api/auth/logout');
      console.log('Logout no servidor realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      console.log('Fazendo logout local...');
      doLocalLogout();
      console.log('Logout concluído');
    }
  }, [doLocalLogout]);

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
  }, [logout]);

  // Configurar axios com token e verificar - APENAS UMA VEZ na inicialização
  useEffect(() => {
    console.log('useEffect inicialização - Executando:', { 
      hasToken: !!token, 
      isInitialized: isInitialized.current
    });
    
    if (token && !isInitialized.current) {
      console.log('Configurando axios com token:', token.substring(0, 20) + '...');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      isInitialized.current = true;
      
      // Verificar token apenas uma vez na inicialização
      console.log('Chamando verifyToken...');
      verifyToken();
    } else if (!token) {
      console.log('Sem token, limpando estado...');
      setUser(null);
      setLoading(false); // Definir loading como false quando não há token
      delete axios.defaults.headers.common['Authorization'];
      isInitialized.current = false;
    }

    // Cleanup
    return () => {
      if (verifyTimeout.current) {
        clearTimeout(verifyTimeout.current);
      }
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, [token, verifyToken]);

  // useEffect adicional para garantir que loading seja false quando não há token
  useEffect(() => {
    if (!token && loading) {
      console.log('Forçando loading como false (sem token)');
      setLoading(false);
    }
  }, [token, loading]);

  // Timeout de segurança para evitar loading infinito (mais responsivo)
  useEffect(() => {
    if (loading && token) {
      console.log('Loading ativo com token, configurando timeout de segurança...');
      const safetyTimeout = setTimeout(() => {
        if (loading && token) {
          console.log('Timeout de segurança: forçando loading como false');
          setLoading(false);
        }
      }, 3000); // Reduzido para 3 segundos para ser mais responsivo

      return () => clearTimeout(safetyTimeout);
    }
  }, [loading, token]);

  // Verificar e renovar token automaticamente - APENAS QUANDO NECESSÁRIO
  useEffect(() => {
    console.log('useEffect token/user - Executando:', { 
      hasToken: !!token, 
      hasUser: !!user, 
      hasInterval: !!tokenCheckInterval.current 
    });
    
    if (token && user && !tokenCheckInterval.current) {
      const checkTokenExpiration = () => {
        if (!user || !token) return;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiration = expirationTime - currentTime;
          
          if (timeUntilExpiration < 5 * 60 * 1000) {
            console.log('Token próximo de expirar, renovando...');
            checkAndRefreshToken();
          }
        } catch (error) {
          console.error('Erro ao verificar expiração do token:', error);
        }
      };

      // Verificar a cada 1 minuto (reduzido de 2 minutos)
      tokenCheckInterval.current = setInterval(checkTokenExpiration, 60 * 1000);
    }

    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
        tokenCheckInterval.current = null;
      }
    };
  }, [token, user, checkAndRefreshToken]);

  // Função para retry com backoff exponencial
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error.response?.status === 429 && i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          console.log(`Rate limiting, aguardando ${delay}ms antes da tentativa ${i + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  const login = async (username, password) => {
    try {
      const loginFn = async () => {
        const response = await axios.post('/api/auth/login', { username, password });
        return response;
      };
      
      // Reduzir retries e delay para melhor performance
      const response = await retryWithBackoff(loginFn, 2, 500);
      
      const { user, accessToken } = response.data;
      
      setUser(user);
      setToken(accessToken);
      setLoading(false);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.status === 429) {
        return { 
          success: false, 
          error: 'Muitas tentativas de login. Aguarde um momento e tente novamente.' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no login' 
      };
    }
  };

  const loginWithGoogle = async (user, accessToken) => {
    try {
      setUser(user);
      setToken(accessToken);
      setLoading(false);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login Google:', error);
      return { 
        success: false, 
        error: 'Erro no login com Google' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { user, accessToken } = response.data;
      
      setUser(user);
      setToken(accessToken);
      setLoading(false);
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no registro' 
      };
    }
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
    token,
    login,
    loginWithGoogle,
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
