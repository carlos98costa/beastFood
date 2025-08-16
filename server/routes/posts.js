const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Função para converter data para UTC-3 (Brasília)
const convertToBrasiliaTime = (date) => {
  if (!date) return date;
  
  // Se a data já é uma string, converter para Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Converter para UTC-3
  const brasiliaTime = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000));
  
  return brasiliaTime.toISOString();
};

// Função para processar posts e converter datas
const processPosts = (posts) => {
  return posts.map(post => ({
    ...post,
    created_at: convertToBrasiliaTime(post.created_at)
  }));
};

// Buscar todos os posts (feed) - público (sem autenticação)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, restaurant_id, user_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user?.id || 0;

    let query = `
      SELECT p.*, 
             u.username, u.name as user_name, u.profile_picture,
             r.name as restaurant_name, r.address,
             COUNT(DISTINCT l.user_id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN restaurants r ON p.restaurant_id = r.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
    `;

    const queryParams = [userId];
    let paramIndex = 2;

    if (restaurant_id) {
      query += ` WHERE p.restaurant_id = $${paramIndex}`;
      queryParams.push(restaurant_id);
      paramIndex++;
    }

    if (user_id) {
      if (query.includes('WHERE')) {
        query += ` AND p.user_id = $${paramIndex}`;
      } else {
        query += ` WHERE p.user_id = $${paramIndex}`;
      }
      queryParams.push(user_id);
      paramIndex++;
    }

    query += `
      GROUP BY p.id, u.username, u.name, u.profile_picture, r.name, r.address
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(parseInt(limit), offset);

    const posts = await pool.query(query, queryParams);

    // Buscar fotos para cada post
    for (let post of posts.rows) {
      const photos = await pool.query(
        'SELECT * FROM post_photos WHERE post_id = $1 ORDER BY uploaded_at ASC',
        [post.id]
      );
      post.photos = photos.rows;
    }

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM posts p
    `;
    
    const countParams = [];
    if (restaurant_id || user_id) {
      countQuery += ' WHERE ';
      const conditions = [];
      
      if (restaurant_id) {
        conditions.push(`p.restaurant_id = $${countParams.length + 1}`);
        countParams.push(restaurant_id);
      }
      
      if (user_id) {
        conditions.push(`p.user_id = $${countParams.length + 1}`);
        countParams.push(user_id);
      }
      
      countQuery += conditions.join(' AND ');
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      posts: processPosts(posts.rows),
      pagination: {
        current: parseInt(page),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar post por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await pool.query(`
      SELECT p.*, 
             u.username, u.name as user_name, u.profile_picture,
             r.name as restaurant_name, r.address,
             COUNT(DISTINCT l.user_id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN restaurants r ON p.restaurant_id = r.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.id = $1
      GROUP BY p.id, u.username, u.name, u.profile_picture, r.name, r.address
    `, [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Buscar fotos
    const photos = await pool.query(
      'SELECT * FROM post_photos WHERE post_id = $1 ORDER BY uploaded_at ASC',
      [id]
    );

    post.rows[0].photos = photos.rows;

    res.json(post.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo post
router.post('/', auth, async (req, res) => {
  try {
    const { restaurant_id, title, content, rating, photos } = req.body;
    const userId = req.user.id;

    if (!restaurant_id || !content || !rating) {
      return res.status(400).json({ error: 'Restaurante, conteúdo e avaliação são obrigatórios' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
    }

    // Verificar se restaurante existe
    const restaurant = await pool.query(
      'SELECT id FROM restaurants WHERE id = $1',
      [restaurant_id]
    );

    if (restaurant.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    // Criar post
    const newPost = await pool.query(`
      INSERT INTO posts (user_id, restaurant_id, title, content, rating)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, restaurant_id, title, content, rating]);

    const postId = newPost.rows[0].id;

    // Adicionar fotos se fornecidas
    if (photos && photos.length > 0) {
      for (let photoUrl of photos) {
        await pool.query(
          'INSERT INTO post_photos (post_id, photo_url) VALUES ($1, $2)',
          [postId, photoUrl]
        );
      }
    }

    // Buscar post completo com fotos
    const completePost = await pool.query(`
      SELECT p.*, 
             u.username, u.name as user_name, u.profile_picture,
             r.name as restaurant_name, r.address
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.id = $1
    `, [postId]);

    const postPhotos = await pool.query(
      'SELECT * FROM post_photos WHERE post_id = $1 ORDER BY uploaded_at ASC',
      [postId]
    );

    completePost.rows[0].photos = postPhotos.rows;

    res.status(201).json({
      message: 'Post criado com sucesso!',
      post: processPosts([completePost.rows[0]])[0]
    });

  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar post
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating, photos } = req.body;
    const userId = req.user.id;

    // Verificar se usuário criou o post
    const post = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [id]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    if (post.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para editar este post' });
    }

    // Atualizar post
    const updatedPost = await pool.query(`
      UPDATE posts 
      SET title = $1, content = $2, rating = $3
      WHERE id = $4
      RETURNING *
    `, [title, content, rating, id]);

    // Atualizar fotos se fornecidas
    if (photos) {
      // Remover fotos antigas
      await pool.query('DELETE FROM post_photos WHERE post_id = $1', [id]);
      
      // Adicionar novas fotos
      for (let photoUrl of photos) {
        await pool.query(
          'INSERT INTO post_photos (post_id, photo_url) VALUES ($1, $2)',
          [id, photoUrl]
        );
      }
    }

    // Buscar post completo com fotos atualizadas
    const completePost = await pool.query(`
      SELECT p.*, 
             u.username, u.name as user_name, u.profile_picture,
             r.name as restaurant_name, r.address
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.id = $1
    `, [id]);

    const postPhotos = await pool.query(
      'SELECT * FROM post_photos WHERE post_id = $1 ORDER BY uploaded_at ASC',
      [id]
    );

    completePost.rows[0].photos = postPhotos.rows;

    res.json({
      message: 'Post atualizado com sucesso!',
      post: processPosts([completePost.rows[0]])[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar post
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se usuário criou o post
    const post = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [id]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    if (post.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar este post' });
    }

    // Deletar post (cascade deletará fotos, likes e comentários)
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({ message: 'Post deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de fotos para posts
router.post('/upload-photo', auth, upload.single('photo'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma foto foi enviada' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Foto enviada com sucesso!',
      photoUrl: photoUrl
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
