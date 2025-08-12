const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Rota de teste simples
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de teste funcionando!' });
});

// Buscar todos os restaurantes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', lat, lng, radius = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Query corrigida - sem referenciar f.id
    let query = `
      SELECT r.*, u.username as created_by_username,
             COUNT(DISTINCT p.id) as posts_count,
             AVG(p.rating) as average_rating,
             COUNT(DISTINCT f.user_id) as favorites_count
      FROM restaurants r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN posts p ON r.id = p.restaurant_id
      LEFT JOIN favorites f ON r.id = f.restaurant_id
    `;

    const whereConditions = [];
    const queryParams = [];

    // Busca por nome ou descrição
    if (search) {
      whereConditions.push(`(r.name ILIKE $${queryParams.length + 1} OR r.description ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }

    // Busca por proximidade (PostGIS) - comentada temporariamente
    /*
    if (lat && lng) {
      whereConditions.push(`
        ST_DWithin(
          r.location::geography, 
          ST_SetSRID(ST_MakePoint($${queryParams.length + 1}, $${queryParams.length + 2}), 4326)::geography, 
          $${queryParams.length + 3} * 1000
        )
      `);
      queryParams.push(parseFloat(lng), parseFloat(lat), parseFloat(radius));
    }
    */

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      GROUP BY r.id, u.username
      ORDER BY r.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    queryParams.push(parseInt(limit), offset);

    console.log('Query executada:', query);
    console.log('Parâmetros:', queryParams);

    const restaurants = await pool.query(query, queryParams);

    console.log('Resultado da query:', restaurants.rows);

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(*) 
      FROM restaurants r
    `;
    
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const totalCount = await pool.query(countQuery, queryParams.slice(0, -2));

    res.json({
      restaurants: restaurants.rows,
      pagination: {
        current: parseInt(page),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message,
      stack: error.stack 
    });
  }
});

// Criar novo restaurante
router.post('/', auth, async (req, res) => {
  try {
    const { name, address, description, cuisine_type, url } = req.body;
    const created_by = req.user.id;

    // Validações básicas
    if (!name || !address) {
      return res.status(400).json({ 
        error: 'Nome e endereço são obrigatórios' 
      });
    }

    // Verificar se já existe um restaurante com o mesmo nome e endereço
    const existingRestaurant = await pool.query(
      'SELECT id FROM restaurants WHERE name = $1 AND address = $2',
      [name, address]
    );

    if (existingRestaurant.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Já existe um restaurante com este nome e endereço' 
      });
    }

    // Inserir novo restaurante
    const insertQuery = `
      INSERT INTO restaurants (name, address, description, cuisine_type, url, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      name, 
      address, 
      description || 'Sem descrição', 
      cuisine_type || 'Não especificado',
      url || null,
      created_by
    ]);

    const newRestaurant = result.rows[0];

    res.status(201).json({
      message: 'Restaurante criado com sucesso!',
      restaurant: newRestaurant
    });

  } catch (error) {
    console.error('Erro ao criar restaurante:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Buscar restaurante por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT r.*, u.username as created_by_username,
             COUNT(DISTINCT p.id) as posts_count,
             AVG(p.rating) as average_rating,
             COUNT(DISTINCT f.user_id) as favorites_count
      FROM restaurants r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN posts p ON r.id = p.restaurant_id
      LEFT JOIN favorites f ON r.id = f.restaurant_id
      WHERE r.id = $1
      GROUP BY r.id, u.username
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Restaurante não encontrado' 
      });
    }

    res.json({
      restaurant: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
