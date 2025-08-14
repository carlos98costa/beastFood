const pool = require('../../config/database');

class RestaurantPhotosService {
  // Buscar todas as fotos de um restaurante
  async getRestaurantPhotos(restaurantId) {
    const result = await pool.query(
      `SELECT id, photo_url, photo_order, caption, created_at
       FROM restaurant_photos 
       WHERE restaurant_id = $1 
       ORDER BY photo_order ASC, created_at ASC`,
      [restaurantId]
    );
    return result.rows;
  }



  // Adicionar nova foto ao restaurante
  async addPhoto(restaurantId, photoData) {
    const { photo_url, caption } = photoData;

    // Determinar a ordem da nova foto
    const orderResult = await pool.query(
      `SELECT COALESCE(MAX(photo_order), -1) + 1 as next_order
       FROM restaurant_photos 
       WHERE restaurant_id = $1`,
      [restaurantId]
    );
    const photo_order = orderResult.rows[0].next_order;

    // Inserir nova foto
    const result = await pool.query(
      `INSERT INTO restaurant_photos (restaurant_id, photo_url, photo_order, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [restaurantId, photo_url, photo_order, caption]
    );
    
    return result.rows[0];
  }

  // Atualizar foto existente
  async updatePhoto(photoId, updateData) {
    const { photo_url, caption, photo_order } = updateData;

    // Atualizar foto
    const result = await pool.query(
      `UPDATE restaurant_photos 
       SET photo_url = COALESCE($2, photo_url),
           caption = COALESCE($3, caption),
           photo_order = COALESCE($4, photo_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [photoId, photo_url, caption, photo_order]
    );
    
    return result.rows[0] || null;
  }

  // Remover foto
  async deletePhoto(photoId) {
    const result = await pool.query(
      `DELETE FROM restaurant_photos WHERE id = $1 RETURNING *`,
      [photoId]
    );
    
    return result.rows[0] || null;
  }

  // Reordenar fotos
  async reorderPhotos(restaurantId, photoOrder) {
    // photoOrder deve ser um array de IDs na ordem desejada
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < photoOrder.length; i++) {
        await client.query(
          `UPDATE restaurant_photos 
           SET photo_order = $1 
           WHERE id = $2 AND restaurant_id = $3`,
          [i, photoOrder[i], restaurantId]
        );
      }
      
      await client.query('COMMIT');
      
      // Retornar fotos reordenadas
      return await this.getRestaurantPhotos(restaurantId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }



  // Contar fotos de um restaurante
  async getPhotoCount(restaurantId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM restaurant_photos WHERE restaurant_id = $1`,
      [restaurantId]
    );
    return parseInt(result.rows[0].count);
  }

  // Buscar fotos com paginação
  async getRestaurantPhotosPaginated(restaurantId, limit = 10, offset = 0) {
    const result = await pool.query(
      `SELECT id, photo_url, photo_order, caption, created_at
       FROM restaurant_photos 
       WHERE restaurant_id = $1 
       ORDER BY photo_order ASC, created_at ASC
       LIMIT $2 OFFSET $3`,
      [restaurantId, limit, offset]
    );
    return result.rows;
  }
}

module.exports = new RestaurantPhotosService();

