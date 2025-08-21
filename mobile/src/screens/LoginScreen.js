import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components';
import globalStyles from '../styles/globalStyles';
import { colors, spacing, typography } from '../styles/constants';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Usar o contexto de autenticação
  const { login, loginWithGoogle, enableGuestMode } = useAuth();

  const handleLogin = async () => {
    // Validação básica
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Chamar a função de login do contexto de autenticação
      const result = await login(username, password);
      
      if (result.success) {
        // Login bem-sucedido - redirecionar para Home
        console.log('LoginScreen - Login bem-sucedido, redirecionando para Main');
        navigation.navigate('Main');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Falha no login. Tente novamente mais tarde.');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Erro ao fazer login com Google');
      }
    } catch (err) {
      console.error('Google Login error:', err);
      setError('Falha no login com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    console.log('LoginScreen - Iniciando modo convidado...');
    await enableGuestMode();
    console.log('LoginScreen - Modo convidado ativado, navegando para Main...');
    // Navegar para a Home após ativar o modo convidado
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <KeyboardAvoidingView 
        style={globalStyles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[globalStyles.h1, styles.title]}>BeastFood</Text>
              <Text style={[globalStyles.bodyLarge, styles.subtitle]}>
                Faça login para continuar
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nome de usuário"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="person"
                variant="outlined"
                error={error && error.includes('usuário') ? error : undefined}
              />

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="lock-closed"
                variant="outlined"
                error={error && error.includes('senha') ? error : undefined}
              />

              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="large"
                style={styles.loginButton}
              />

              <Button
                title="Entrar com Google"
                onPress={handleGoogleLogin}
                loading={loading}
                variant="outline"
                size="large"
                icon="logo-google"
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Continuar como Convidado"
                onPress={handleGuestMode}
                variant="ghost"
                size="large"
                icon="eye-outline"
                style={styles.guestButton}
              />

              <Button
                title="Não tem uma conta? Cadastre-se"
                onPress={() => navigation.navigate('Register')}
                variant="ghost"
                style={styles.registerButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    color: '#ef4444',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: '#6b7280',
    fontSize: 14,
  },
  guestButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});

export default LoginScreen;