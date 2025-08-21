# Solução para Erro de Logout no Mobile - BeastFood

## Problema Identificado

Quando o usuário tentava fazer logout no aplicativo mobile, ocorria o seguinte erro:

```
ERROR  The action 'RESET' with payload {"index":0,"routes":[{"name":"Login"}]} was not handled by any navigator.
```

## Causa do Problema

O erro ocorria porque o código estava tentando usar `navigation.reset()` para navegar diretamente para a tela 'Login', mas essa tela não estava acessível no contexto atual da navegação aninhada.

No `ProfileScreen.js`, o código estava fazendo:

```javascript
navigation.reset({
  index: 0,
  routes: [{ name: 'Login' }],
});
```

Porém, a tela 'Login' só está disponível quando o usuário **não está autenticado**. Quando o usuário está logado, o `AppNavigator` mostra apenas as telas do `TabNavigator` (Main, RestaurantDetail, CreatePost, PostComments).

## Solução Implementada

### Arquivo Modificado: `mobile/src/screens/ProfileScreen.js`

Removemos a tentativa de navegação manual e deixamos o `AppNavigator` gerenciar automaticamente a navegação baseada no estado de autenticação:

```javascript
const handleLogout = async () => {
  Alert.alert(
    'Sair',
    'Tem certeza que deseja sair da sua conta?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // O AppNavigator irá automaticamente redirecionar para Login
            // baseado no estado de autenticação (isAuthenticated = false)
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível sair da conta.');
          }
        }
      },
    ]
  );
};
```

## Como Funciona a Solução

1. **Logout do Contexto**: Quando `logout()` é chamado, ele:
   - Remove os dados do AsyncStorage (`@beastfood:user`, `@beastfood:token`)
   - Atualiza o estado: `setUser(null)` e `setToken(null)`
   - Isso faz com que `isAuthenticated` se torne `false`

2. **Reação do AppNavigator**: O `AppNavigator` monitora o estado `isAuthenticated`:
   ```javascript
   const { isAuthenticated, loading } = useAuth();
   
   return (
     <NavigationContainer>
       <Stack.Navigator 
         initialRouteName={isAuthenticated ? "Main" : "Login"} 
         screenOptions={{ headerShown: false }}
       >
         {isAuthenticated ? (
           // Telas para usuário logado
         ) : (
           // Telas para usuário não logado
           <>
             <Stack.Screen name="Login" component={LoginScreen} />
             <Stack.Screen name="Register" component={RegisterScreen} />
           </>
         )}
       </Stack.Navigator>
     </NavigationContainer>
   );
   ```

3. **Redirecionamento Automático**: Quando `isAuthenticated` muda para `false`, o React Navigation automaticamente reconstrói a pilha de navegação e mostra as telas de autenticação.

## Benefícios da Solução

- ✅ **Elimina o erro**: Não há mais tentativas de navegação manual para telas inacessíveis
- ✅ **Arquitetura limpa**: O estado de autenticação controla a navegação de forma centralizada
- ✅ **Consistência**: O mesmo padrão funciona em todo o aplicativo
- ✅ **Manutenibilidade**: Mudanças na estrutura de navegação não afetam o logout
- ✅ **Robustez**: Funciona independentemente de onde o logout é chamado

## Teste da Solução

Para testar se a solução funciona:

1. **Fazer login** no aplicativo mobile
2. **Navegar para o perfil** do usuário
3. **Clicar no botão de logout** (ícone de sair)
4. **Confirmar** o logout no alerta
5. **Verificar** que o aplicativo retorna automaticamente para a tela de Login
6. **Confirmar** que não há mais erros no console

## Considerações Técnicas

- A solução aproveita o padrão de "single source of truth" do React
- O estado de autenticação é a única fonte que determina qual conjunto de telas está disponível
- Não há necessidade de navegação manual entre contextos de autenticação diferentes
- A solução é compatível com React Navigation v6

## Arquivos Envolvidos

- `mobile/src/screens/ProfileScreen.js` - Removida navegação manual
- `mobile/src/contexts/AuthContext.js` - Gerencia estado de autenticação
- `mobile/src/navigation/AppNavigator.js` - Controla navegação baseada em autenticação