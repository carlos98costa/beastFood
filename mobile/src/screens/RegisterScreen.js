import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components';
import globalStyles from '../styles/globalStyles';
import { colors, spacing, typography } from '../styles/constants';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Usar o contexto de autenticação
  const { register } = useAuth();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleRegister = async () => {
    // Validação básica
    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Chamar a função de registro do contexto de autenticação
      const result = await register({ name, username, email, password });
      
      if (result.success) {
        // Registro bem-sucedido, usuário já está logado
        Alert.alert(
          'Registro bem-sucedido',
          'Sua conta foi criada com sucesso!',
          [{ 
            text: 'OK',
            onPress: () => {
              // Redirecionar para Home após registro bem-sucedido
              console.log('RegisterScreen - Registro bem-sucedido, redirecionando para Main');
              navigation.navigate('Main');
            }
          }]
        );
      } else {
        setError(result.error || 'Erro ao criar conta');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Falha no registro. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
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
              <Text style={[globalStyles.h2, styles.title]}>Criar Conta</Text>
              <Text style={[globalStyles.bodyMedium, styles.subtitle]}>
                Preencha os dados para se cadastrar
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nome completo"
                placeholder="Digite seu nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                leftIcon="person"
                variant="outlined"
                required
              />

              <Input
                label="Nome de usuário"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="at"
                variant="outlined"
                required
              />

              <Input
                label="E-mail"
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail"
                variant="outlined"
                required
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
                required
                helperText="Mínimo 6 caracteres"
              />

              <Input
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="lock-closed"
                variant="outlined"
                required
                error={confirmPassword && password !== confirmPassword ? 'As senhas não coincidem' : undefined}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={[globalStyles.bodySmall, styles.errorText]}>{error}</Text>
                </View>
              )}

              <Button
                title="Cadastrar"
                onPress={handleRegister}
                loading={loading}
                variant="primary"
                size="large"
                style={styles.registerButton}
              />

              <Button
                title="Já tem uma conta? Faça login"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
                style={styles.loginButton}
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
    marginBottom: spacing.xl,
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  registerButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
});

export default RegisterScreen;