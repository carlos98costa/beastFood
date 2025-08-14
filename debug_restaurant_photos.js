const axios = require('axios');

axios.defaults.baseURL = 'http://localhost:5000/api';

async function debugRestaurantPhotos() {
  try {
    console.log('🔍 Debugando sistema de fotos...');
    
    // 1. Testar endpoint básico
    console.log('\n📋 1. Testando endpoint básico...');
    const basicResponse = await axios.get('/restaurants/6');
    console.log('✅ Endpoint básico funcionando');
    console.log('   - Nome:', basicResponse.data.restaurant.name);
    console.log('   - Main photo URL:', basicResponse.data.restaurant.main_photo_url);
    
    // 2. Testar endpoint com fotos
    console.log('\n📋 2. Testando endpoint com fotos...');
    const photosResponse = await axios.get('/restaurants/6?includePhotos=true');
    console.log('✅ Endpoint com fotos funcionando');
    console.log('   - Nome:', photosResponse.data.restaurant.name);
    console.log('   - Fotos:', photosResponse.data.restaurant.photos);
    console.log('   - Main photo:', photosResponse.data.restaurant.main_photo);
    
    // 3. Testar endpoint específico de fotos
    console.log('\n📋 3. Testando endpoint de fotos...');
    const specificPhotosResponse = await axios.get('/restaurant-photos/restaurants/6/photos');
    console.log('✅ Endpoint de fotos funcionando');
    console.log('   - Dados:', specificPhotosResponse.data);
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Dados:', error.response.data);
    }
  }
}

debugRestaurantPhotos();
