const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [[totais]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM filmes)  AS filmes,
         (SELECT COUNT(*) FROM atores)  AS atores,
         (SELECT COUNT(*) FROM generos) AS generos`
    );
    res.render('index', { totais: totais });
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao conectar no banco de dados. Confira o arquivo db.js.');
  }
});

module.exports = router;
