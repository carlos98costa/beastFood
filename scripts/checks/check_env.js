require('dotenv').config();

console.log('🔍 Verificando variáveis de ambiente:');
console.log('📍 PORT:', process.env.PORT);
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 DB_HOST:', process.env.DB_HOST);
console.log('📍 DB_NAME:', process.env.DB_NAME);
console.log('📍 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado');
console.log('📍 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');

if (process.env.GOOGLE_CLIENT_ID) {
  console.log('📍 GOOGLE_CLIENT_ID valor:', process.env.GOOGLE_CLIENT_ID);
} else {
  console.log('❌ GOOGLE_CLIENT_ID não encontrado no .env');
  console.log('💡 Adicione ao arquivo .env na raiz do projeto:');
  console.log('GOOGLE_CLIENT_ID=1061381797582-5u0saa85s10ncvt8j2ikivdm8qi409e.u.apps.googleusercontent.com');
}
