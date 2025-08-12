import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configurar URL base do axios
axios.defaults.baseURL = 'http://localhost:5000';
console.log('Axios configurado com baseURL:', axios.defaults.baseURL);

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configurar axios com token
  useEffect(() => {
    console.log('useEffect token mudou:', token);
    if (token) {
      console.log('Configurando axios com token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      console.log('Sem token, definindo loading como false');
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      console.log('Verificando token:', token);
      const response = await axios.get('/api/auth/verify');
      console.log('Token válido, usuário:', response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Tentando login com:', { username, password: '***' });
      const response = await axios.post('/api/auth/login', { username, password });
      console.log('Resposta do login:', response.data);
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Login bem-sucedido, usuário definido:', user);
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
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Registro bem-sucedido, usuário definido:', user);
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
