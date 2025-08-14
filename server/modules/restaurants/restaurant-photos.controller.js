const restaurantPhotosService = require('./restaurant-photos.service');
const { upload } = require('../../middleware/upload');

class RestaurantPhotosController {
  // Buscar todas as fotos de um restaurante
  async getRestaurantPhotos(req, res) {
    try {
      const { restaurantId } = req.params;
      const photos = await restaurantPhotosService.getRestaurantPhotos(restaurantId);
      
      res.json({
        success: true,
        data: photos,
        count: photos.length
      });
    } catch (error) {
      console.error('Erro ao buscar fotos do restaurante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar foto principal de um restaurante
  async getMainPhoto(req, res) {
    try {
      const { restaurantId } = req.params;
      const photo = await restaurantPhotosService.getMainPhoto(restaurantId);
      
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: 'Foto principal não encontrada'
        });
      }
      
      res.json({
        success: true,
        data: photo
      });
    } catch (error) {
      console.error('Erro ao buscar foto principal:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar nova foto ao restaurante
  async addPhoto(req, res) {
    try {
      const { restaurantId } = req.params;
      const { caption, is_main } = req.body;
      
      // Verificar se há arquivo enviado
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma foto foi enviada'
        });
      }
      
      const photoData = {
        photo_url: `/uploads/${req.file.filename}`,
        caption: caption || '',
        is_main: is_main === 'true' || is_main === true
      };
      
      const newPhoto = await restaurantPhotosService.addPhoto(restaurantId, photoData);
      
      res.status(201).json({
        success: true,
        message: 'Foto adicionada com sucesso',
        data: newPhoto
      });
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar foto existente
  async updatePhoto(req, res) {
    try {
      const { photoId } = req.params;
      const updateData = req.body;
      
      // Se há novo arquivo, atualizar URL
      if (req.file) {
        updateData.photo_url = `/uploads/${req.file.filename}`;
      }
      
      const updatedPhoto = await restaurantPhotosService.updatePhoto(photoId, updateData);
      
      if (!updatedPhoto) {
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Foto atualizada com sucesso',
        data: updatedPhoto
      });
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Remover foto
  async deletePhoto(req, res) {
    try {
      const { photoId } = req.params;
      const deletedPhoto = await restaurantPhotosService.deletePhoto(photoId);
      
      if (!deletedPhoto) {
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Foto removida com sucesso',
        data: deletedPhoto
      });
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Reordenar fotos
  async reorderPhotos(req, res) {
    try {
      const { restaurantId } = req.params;
      const { photoOrder } = req.body;
      
      if (!Array.isArray(photoOrder)) {
        return res.status(400).json({
          success: false,
          error: 'Ordem das fotos deve ser um array'
        });
      }
      
      const reorderedPhotos = await restaurantPhotosService.reorderPhotos(restaurantId, photoOrder);
      
      res.json({
        success: true,
        message: 'Fotos reordenadas com sucesso',
        data: reorderedPhotos
      });
    } catch (error) {
      console.error('Erro ao reordenar fotos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Definir foto como principal
  async setMainPhoto(req, res) {
    try {
      const { photoId } = req.params;
      const mainPhoto = await restaurantPhotosService.setMainPhoto(photoId);
      
      res.json({
        success: true,
        message: 'Foto definida como principal com sucesso',
        data: mainPhoto
      });
    } catch (error) {
      console.error('Erro ao definir foto principal:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Contar fotos de um restaurante
  async getPhotoCount(req, res) {
    try {
      const { restaurantId } = req.params;
      const count = await restaurantPhotosService.getPhotoCount(restaurantId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Erro ao contar fotos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Upload múltiplo de fotos
  async uploadMultiplePhotos(req, res) {
    try {
      const { restaurantId } = req.params;
      const { captions } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma foto foi enviada'
        });
      }
      
      const uploadedPhotos = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const caption = captions && captions[i] ? captions[i] : '';
        
        const photoData = {
          photo_url: `/uploads/${file.filename}`,
          caption,
          is_main: i === 0 // Primeira foto será a principal
        };
        
        const newPhoto = await restaurantPhotosService.addPhoto(restaurantId, photoData);
        uploadedPhotos.push(newPhoto);
      }
      
      res.status(201).json({
        success: true,
        message: `${uploadedPhotos.length} fotos adicionadas com sucesso`,
        data: uploadedPhotos
      });
    } catch (error) {
      console.error('Erro ao fazer upload múltiplo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new RestaurantPhotosController();
