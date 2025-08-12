const restaurantsService = require('./restaurants.service');

class RestaurantsController {
  // Criar novo restaurante
  async createRestaurant(req, res) {
    try {
      const restaurantData = req.body;

      // Validações básicas
      if (!restaurantData.name || restaurantData.name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome do restaurante deve ter pelo menos 2 caracteres' });
      }

      if (restaurantData.price_range && (restaurantData.price_range < 1 || restaurantData.price_range > 5)) {
        return res.status(400).json({ error: 'Faixa de preço deve estar entre 1 e 5' });
      }

      const newRestaurant = await restaurantsService.createRestaurant(restaurantData);

      res.status(201).json({
        message: 'Restaurante criado com sucesso!',
        restaurant: newRestaurant
      });

    } catch (error) {
      console.error('Erro ao criar restaurante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar restaurante por ID
  async getRestaurant(req, res) {
    try {
      const { id } = req.params;

      const restaurant = await restaurantsService.findRestaurantById(id);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }

      res.json({ restaurant });

    } catch (error) {
      console.error('Erro ao buscar restaurante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar todos os restaurantes
  async getAllRestaurants(req, res) {
    try {
      const { limit = 20, offset = 0, cuisine_type, price_range } = req.query;
      
      const filters = {};
      if (cuisine_type) filters.cuisine_type = cuisine_type;
      if (price_range) filters.price_range = parseInt(price_range);

      const restaurants = await restaurantsService.getAllRestaurants(
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({ restaurants });

    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar restaurantes próximos
  async getNearbyRestaurants(req, res) {
    try {
      const { latitude, longitude, radius = 5000, limit = 20 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ 
          error: 'Latitude e longitude são obrigatórias para busca por proximidade' 
        });
      }

      const restaurants = await restaurantsService.getNearbyRestaurants(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        parseInt(limit)
      );

      res.json({ restaurants });

    } catch (error) {
      console.error('Erro ao buscar restaurantes próximos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar restaurantes por termo
  async searchRestaurants(req, res) {
    try {
      const { q, limit = 20, offset = 0 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ 
          error: 'Termo de busca deve ter pelo menos 2 caracteres' 
        });
      }

      const restaurants = await restaurantsService.searchRestaurants(
        q.trim(), 
        parseInt(limit), 
        parseInt(offset)
      );

      res.json({ restaurants });

    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar restaurante
  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validações básicas
      if (updateData.name && updateData.name.trim().length < 2) {
        return res.status(400).json({ 
          error: 'Nome do restaurante deve ter pelo menos 2 caracteres' 
        });
      }

      if (updateData.price_range && (updateData.price_range < 1 || updateData.price_range > 5)) {
        return res.status(400).json({ 
          error: 'Faixa de preço deve estar entre 1 e 5' 
        });
      }

      const updatedRestaurant = await restaurantsService.updateRestaurant(id, updateData);
      if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }

      res.json({
        message: 'Restaurante atualizado com sucesso!',
        restaurant: updatedRestaurant
      });

    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar restaurante
  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;

      const deletedRestaurant = await restaurantsService.deleteRestaurant(id);
      if (!deletedRestaurant) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }

      res.json({ message: 'Restaurante deletado com sucesso!' });

    } catch (error) {
      console.error('Erro ao deletar restaurante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar tipos de culinária
  async getCuisineTypes(req, res) {
    try {
      const cuisineTypes = await restaurantsService.getCuisineTypes();

      res.json({ cuisineTypes });

    } catch (error) {
      console.error('Erro ao buscar tipos de culinária:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar faixas de preço
  async getPriceRanges(req, res) {
    try {
      const priceRanges = await restaurantsService.getPriceRanges();

      res.json({ priceRanges });

    } catch (error) {
      console.error('Erro ao buscar faixas de preço:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar favoritos do usuário
  async getUserFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const favorites = await restaurantsService.getUserFavorites(
        userId, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.json({ favorites });

    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Adicionar aos favoritos
  async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: 'ID do restaurante é obrigatório' });
      }

      // Verificar se restaurante existe
      const restaurant = await restaurantsService.findRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }

      // Verificar se já está nos favoritos
      const isFavorite = await restaurantsService.isUserFavorite(userId, restaurantId);
      if (isFavorite) {
        return res.status(400).json({ error: 'Restaurante já está nos favoritos' });
      }

      await restaurantsService.addToFavorites(userId, restaurantId);

      res.json({ message: 'Restaurante adicionado aos favoritos!' });

    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Remover dos favoritos
  async removeFromFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { restaurantId } = req.params;

      // Verificar se está nos favoritos
      const isFavorite = await restaurantsService.isUserFavorite(userId, restaurantId);
      if (!isFavorite) {
        return res.status(400).json({ error: 'Restaurante não está nos favoritos' });
      }

      await restaurantsService.removeFromFavorites(userId, restaurantId);

      res.json({ message: 'Restaurante removido dos favoritos!' });

    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new RestaurantsController();
