const pool = require('./server/config/database');

async function checkProfilePicture() {
  try {
    const result = await pool.query(
      'SELECT username, profile_picture, email FROM users WHERE username = $1',
      ['carloscosta']
    );
    
    console.log('Resultado da consulta:');
    console.log(result.rows);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('\nDetalhes do usuário:');
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Profile Picture URL:', user.profile_picture);
      
      if (user.profile_picture) {
        console.log('\nVerificando URL da foto:');
        console.log('URL completa:', user.profile_picture);
        console.log('URL termina com "googleusercontent.com"?', user.profile_picture.endsWith('googleusercontent.com'));
        console.log('URL contém "googleuserconter"?', user.profile_picture.includes('googleuserconter'));
      } else {
        console.log('\n❌ Nenhuma foto de perfil encontrada');
      }
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('Erro ao consultar banco:', error);
  } finally {
    await pool.end();
  }
}

checkProfilePicture();
