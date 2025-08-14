const express = require('express');
const router = express.Router();
const restaurantPhotosController = require('./restaurant-photos.controller');
const { upload } = require('../../middleware/upload');
const auth = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// Configurar upload para múltiplas fotos
const multipleUpload = upload.array('photos', 10); // Máximo 10 fotos por vez

// Rotas públicas (sem autenticação)
router.get('/restaurants/:restaurantId/photos', restaurantPhotosController.getRestaurantPhotos);
router.get('/restaurants/:restaurantId/photos/main', restaurantPhotosController.getMainPhoto);
router.get('/restaurants/:restaurantId/photos/count', restaurantPhotosController.getPhotoCount);

// Rotas protegidas (requer autenticação)
// Adicionar foto única
router.post('/restaurants/:restaurantId/photos', 
  auth,
  upload.single('photo'), 
  restaurantPhotosController.addPhoto
);

// Upload múltiplo de fotos
router.post('/restaurants/:restaurantId/photos/multiple', 
  auth,
  multipleUpload, 
  restaurantPhotosController.uploadMultiplePhotos
);

// Atualizar foto
router.put('/restaurants/:restaurantId/photos/:photoId', 
  auth,
  upload.single('photo'), 
  restaurantPhotosController.updatePhoto
);

// Remover foto
router.delete('/restaurants/:restaurantId/photos/:photoId', 
  auth,
  restaurantPhotosController.deletePhoto
);

// Reordenar fotos
router.put('/restaurants/:restaurantId/photos/reorder', 
  auth,
  restaurantPhotosController.reorderPhotos
);

// Definir foto como principal
router.put('/restaurants/:restaurantId/photos/:photoId/main', 
  auth,
  restaurantPhotosController.setMainPhoto
);

module.exports = router;
