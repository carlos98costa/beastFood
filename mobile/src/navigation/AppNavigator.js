import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Importar telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostCommentsScreen from '../screens/PostCommentsScreen';
import EditPostScreen from '../screens/EditPostScreen';

// Criar navegadores
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de abas para usuários autenticados e convidados
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Restaurants') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'normal',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Início'
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Buscar'
        }}
      />
      <Tab.Screen 
        name="Restaurants" 
        component={RestaurantsScreen}
        options={{
          title: 'Restaurantes'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil'
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal do aplicativo
const AppNavigator = () => {
  const { isAuthenticated, isGuestMode, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return null; // ou um componente de loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
      >
        {/* Tela principal sempre disponível */}
        <Stack.Screen name="Main" component={TabNavigator} />
        
        {/* Telas de detalhes sempre disponíveis */}
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        
        {/* Telas de autenticação sempre disponíveis */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Telas restritas apenas para usuários autenticados */}
        {!isGuestMode && (
          <>
            <Stack.Screen 
              name="CreatePost" 
              component={CreatePostScreen}
              options={{
                headerShown: true,
                title: 'Criar Post',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#333',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="PostComments" 
              component={PostCommentsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="EditPost" 
              component={EditPostScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;