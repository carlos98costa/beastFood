const pool = require('../../config/database');

class RestaurantPhotosService {
  // Buscar todas as fotos de um restaurante
  async getRestaurantPhotos(restaurantId) {
    const result = await pool.query(
      `SELECT id, photo_url, photo_order, is_main, caption, created_at
       FROM restaurant_photos 
       WHERE restaurant_id = $1 
       ORDER BY photo_order ASC, created_at ASC`,
      [restaurantId]
    );
    return result.rows;
  }

  // Buscar foto principal de um restaurante
  async getMainPhoto(restaurantId) {
    const result = await pool.query(
      `SELECT id, photo_url, caption 
       FROM restaurant_photos 
       WHERE restaurant_id = $1 AND is_main = true`,
      [restaurantId]
    );
    return result.rows[0] || null;
  }

  // Adicionar nova foto ao restaurante
  async addPhoto(restaurantId, photoData) {
    const { photo_url, caption, is_main = false } = photoData;
    
    // Se esta foto será a principal, remover a principal atual
    if (is_main) {
      await pool.query(
        `UPDATE restaurant_photos 
         SET is_main = false 
         WHERE restaurant_id = $1 AND is_main = true`,
        [restaurantId]
      );
    }

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
      `INSERT INTO restaurant_photos (restaurant_id, photo_url, photo_order, is_main, caption)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [restaurantId, photo_url, photo_order, is_main, caption]
    );
    
    return result.rows[0];
  }

  // Atualizar foto existente
  async updatePhoto(photoId, updateData) {
    const { photo_url, caption, is_main, photo_order } = updateData;
    
    // Se esta foto será a principal, remover a principal atual do mesmo restaurante
    if (is_main) {
      const photoResult = await pool.query(
        `SELECT restaurant_id FROM restaurant_photos WHERE id = $1`,
        [photoId]
      );
      
      if (photoResult.rows[0]) {
        await pool.query(
          `UPDATE restaurant_photos 
           SET is_main = false 
           WHERE restaurant_id = $1 AND is_main = true AND id != $2`,
          [photoResult.rows[0].restaurant_id, photoId]
        );
      }
    }

    // Atualizar foto
    const result = await pool.query(
      `UPDATE restaurant_photos 
       SET photo_url = COALESCE($2, photo_url),
           caption = COALESCE($3, caption),
           is_main = COALESCE($4, is_main),
           photo_order = COALESCE($5, photo_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [photoId, photo_url, caption, is_main, photo_order]
    );
    
    return result.rows[0] || null;
  }

  // Remover foto
  async deletePhoto(photoId) {
    const result = await pool.query(
      `DELETE FROM restaurant_photos WHERE id = $1 RETURNING *`,
      [photoId]
    );
    
    if (result.rows[0] && result.rows[0].is_main) {
      // Se era a foto principal, definir a próxima como principal
      const nextPhotoResult = await pool.query(
        `SELECT id FROM restaurant_photos 
         WHERE restaurant_id = $1 
         ORDER BY photo_order ASC, created_at ASC 
         LIMIT 1`,
        [result.rows[0].restaurant_id]
      );
      
      if (nextPhotoResult.rows[0]) {
        await pool.query(
          `UPDATE restaurant_photos 
           SET is_main = true 
           WHERE id = $1`,
          [nextPhotoResult.rows[0].id]
        );
      }
    }
    
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

  // Definir foto como principal
  async setMainPhoto(photoId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Buscar restaurante da foto
      const photoResult = await client.query(
        `SELECT restaurant_id FROM restaurant_photos WHERE id = $1`,
        [photoId]
      );
      
      if (!photoResult.rows[0]) {
        throw new Error('Foto não encontrada');
      }
      
      const restaurantId = photoResult.rows[0].restaurant_id;
      
      // Remover foto principal atual
      await client.query(
        `UPDATE restaurant_photos 
         SET is_main = false 
         WHERE restaurant_id = $1 AND is_main = true`,
        [restaurantId]
      );
      
      // Definir nova foto principal
      const result = await client.query(
        `UPDATE restaurant_photos 
         SET is_main = true 
         WHERE id = $1
         RETURNING *`,
        [photoId]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
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
      `SELECT id, photo_url, photo_order, is_main, caption, created_at
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
