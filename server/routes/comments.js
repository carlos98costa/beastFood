const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Buscar comentários de um post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await pool.query(`
      SELECT c.*, u.username, u.name as user_name, u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `, [postId, parseInt(limit), offset]);

    // Contar total de comentários
    const totalCount = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = $1',
      [postId]
    );

    res.json({
      comments: comments.rows,
      pagination: {
        current: parseInt(page),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar comentário
router.post('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
    }

    // Verificar se post existe
    const post = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Criar comentário
    const newComment = await pool.query(`
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [postId, userId, content.trim()]);

    // Buscar comentário completo com dados do usuário
    const completeComment = await pool.query(`
      SELECT c.*, u.username, u.name as user_name, u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [newComment.rows[0].id]);

    res.status(201).json({
      message: 'Comentário adicionado com sucesso!',
      comment: completeComment.rows[0]
    });

  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar comentário
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
    }

    // Verificar se comentário existe e pertence ao usuário
    const comment = await pool.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [id]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    if (comment.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para editar este comentário' });
    }

    // Atualizar comentário
    const updatedComment = await pool.query(`
      UPDATE comments 
      SET content = $1
      WHERE id = $2
      RETURNING *
    `, [content.trim(), id]);

    res.json({
      message: 'Comentário atualizado com sucesso!',
      comment: updatedComment.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar comentário
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se comentário existe e pertence ao usuário
    const comment = await pool.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [id]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    if (comment.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar este comentário' });
    }

    // Deletar comentário
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: 'Comentário deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
