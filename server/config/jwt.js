// Configuração JWT
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'beastfood_jwt_secret_2024_super_seguro_e_unico_para_producao';

console.log('Configuração JWT - JWT_SECRET:', JWT_SECRET ? '***' : 'undefined');

module.exports = {
  JWT_SECRET
};
