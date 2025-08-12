const express = require('express');
const router = express.Router();

// Rota de teste muito simples
router.get('/', (req, res) => {
  res.json({ message: 'Rota de teste funcionando!' });
});

module.exports = router;
