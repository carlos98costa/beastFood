const pool = require('../../config/database');

class RestaurantsService {
  // Criar novo restaurante
  async createRestaurant(restaurantData) {
    const { name, description, address, phone, website, cuisine_type, price_range, latitude, longitude } = restaurantData;
    
    let location = null;
    if (latitude && longitude) {
      location = `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`;
    }

    const query = `
      INSERT INTO restaurants (name, description, address, phone, website, cuisine_type, price_range, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ${location})
      RETURNING *
    `;

    const values = [name, description, address, phone, website, cuisine_type, price_range];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Buscar restaurante por ID
  async findRestaurantById(id) {
    const result = await pool.query(
      `SELECT r.*, 
              COUNT(DISTINCT p.id) as posts_count,
              COUNT(DISTINCT f.id) as favorites_count,
              AVG(p.rating) as average_rating
       FROM restaurants r
       LEFT JOIN posts p ON r.id = p.restaurant_id
       LEFT JOIN favorites f ON r.id = f.restaurant_id
       WHERE r.id = $1
       GROUP BY r.id`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Buscar todos os restaurantes com paginação
  async getAllRestaurants(limit = 20, offset = 0, filters = {}) {
    let whereClause = '';
    const values = [];
    let valueIndex = 1;

    if (filters.cuisine_type) {
      whereClause += ` WHERE r.cuisine_type = $${valueIndex}`;
      values.push(filters.cuisine_type);
      valueIndex++;
    }

    if (filters.price_range) {
      const operator = whereClause ? 'AND' : 'WHERE';
      whereClause += ` ${operator} r.price_range = $${valueIndex}`;
      values.push(filters.price_range);
      valueIndex++;
    }

    const query = `
      SELECT r.*, 
              COUNT(DISTINCT p.id) as posts_count,
              COUNT(DISTINCT f.id) as favorites_count,
              AVG(p.rating) as average_rating
       FROM restaurants r
       LEFT JOIN posts p ON r.id = p.restaurant_id
       LEFT JOIN favorites f ON r.id = f.restaurant_id
       ${whereClause}
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);
    
    return result.rows;
  }

  // Buscar restaurantes próximos usando PostGIS
  async getNearbyRestaurants(latitude, longitude, radiusMeters = 5000, limit = 20) {
    try {
      const result = await pool.query(
        `SELECT r.*, 
                COUNT(DISTINCT p.id) as posts_count,
                COUNT(DISTINCT f.id) as favorites_count,
                AVG(p.rating) as average_rating,
                ST_Distance(
                  r.location::geography,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distance_meters
         FROM restaurants r
         LEFT JOIN posts p ON r.id = p.restaurant_id
         LEFT JOIN favorites f ON r.id = f.restaurant_id
         WHERE ST_DWithin(
           r.location::geography,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )
         GROUP BY r.id, r.location
         ORDER BY distance_meters
         LIMIT $4`,
        [longitude, latitude, radiusMeters, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar restaurantes próximos:', error);
      // Fallback para busca sem geolocalização
      return this.getAllRestaurants(limit);
    }
  }

  // Buscar restaurantes por termo
  async searchRestaurants(searchTerm, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT r.*, 
              COUNT(DISTINCT p.id) as posts_count,
              COUNT(DISTINCT f.id) as favorites_count,
              AVG(p.rating) as average_rating
       FROM restaurants r
       LEFT JOIN posts p ON r.id = p.restaurant_id
       LEFT JOIN favorites f ON r.id = f.restaurant_id
       WHERE r.name ILIKE $1 OR r.description ILIKE $1 OR r.cuisine_type ILIKE $1
       GROUP BY r.id
       ORDER BY r.name
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );
    
    return result.rows;
  }

  // Atualizar restaurante
  async updateRestaurant(id, updateData) {
    const { name, description, address, phone, website, cuisine_type, price_range, latitude, longitude } = updateData;
    
    let locationUpdate = '';
    if (latitude && longitude) {
      locationUpdate = `, location = ST_SetSRID(ST_MakePoint($${Object.keys(updateData).length + 1}, $${Object.keys(updateData).length + 2})`;
    }

    const query = `
      UPDATE restaurants 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          address = COALESCE($3, address),
          phone = COALESCE($4, phone),
          website = COALESCE($5, website),
          cuisine_type = COALESCE($6, cuisine_type),
          price_range = COALESCE($7, price_range),
          updated_at = CURRENT_TIMESTAMP
          ${locationUpdate}
      WHERE id = $${Object.keys(updateData).length + (locationUpdate ? 3 : 1)}
      RETURNING *
    `;

    const values = [name, description, address, phone, website, cuisine_type, price_range];
    if (latitude && longitude) {
      values.push(longitude, latitude);
    }
    values.push(id);

    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  // Deletar restaurante
  async deleteRestaurant(id) {
    const result = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Buscar tipos de culinária disponíveis
  async getCuisineTypes() {
    const result = await pool.query(
      'SELECT DISTINCT cuisine_type FROM restaurants WHERE cuisine_type IS NOT NULL ORDER BY cuisine_type'
    );
    
    return result.rows.map(row => row.cuisine_type);
  }

  // Buscar faixas de preço disponíveis
  async getPriceRanges() {
    const result = await pool.query(
      'SELECT DISTINCT price_range FROM restaurants WHERE price_range IS NOT NULL ORDER BY price_range'
    );
    
    return result.rows.map(row => row.price_range);
  }

  // Buscar restaurantes favoritados por um usuário
  async getUserFavorites(userId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT r.*, 
              COUNT(DISTINCT p.id) as posts_count,
              COUNT(DISTINCT f2.id) as favorites_count,
              AVG(p.rating) as average_rating
       FROM favorites f
       JOIN restaurants r ON f.restaurant_id = r.id
       LEFT JOIN posts p ON r.id = p.restaurant_id
       LEFT JOIN favorites f2 ON r.id = f2.restaurant_id
       WHERE f.user_id = $1
       GROUP BY r.id
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return result.rows;
  }

  // Verificar se usuário favoritou restaurante
  async isUserFavorite(userId, restaurantId) {
    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND restaurant_id = $2',
      [userId, restaurantId]
    );
    
    return result.rows.length > 0;
  }

  // Adicionar aos favoritos
  async addToFavorites(userId, restaurantId) {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, restaurant_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, restaurant_id) DO NOTHING
       RETURNING id`,
      [userId, restaurantId]
    );
    
    return result.rows[0];
  }

  // Remover dos favoritos
  async removeFromFavorites(userId, restaurantId) {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND restaurant_id = $2 RETURNING id',
      [userId, restaurantId]
    );
    
    return result.rows[0];
  }
}

module.exports = new RestaurantsService();
