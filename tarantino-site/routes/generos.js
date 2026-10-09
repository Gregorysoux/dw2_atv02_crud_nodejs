const express = require('express');
const router = express.Router();
const db = require('../db');

function validar(body) {
  if (!body.nome || body.nome.trim() === '') return 'Informe o nome do gênero.';
  return null;
}

// LISTAR
router.get('/', async (req, res) => {
  try {
    const [generos] = await db.query(
      `SELECT g.id, g.nome, g.descricao, COUNT(f.id) AS total_filmes
       FROM generos g
       LEFT JOIN filmes f ON f.genero_id = g.id
       GROUP BY g.id, g.nome, g.descricao
       ORDER BY g.nome`
    );
    res.render('generos', { generos: generos });
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao listar gêneros');
  }
});

// FORMULÁRIO NOVO
router.get('/novo', (req, res) => {
  res.render('generos-form', {
    tituloPagina: 'Novo gênero',
    acao: '/generos',
    genero: { nome: '', descricao: '' },
    erro: null
  });
});

// CRIAR
router.post('/', async (req, res) => {
  const erro = validar(req.body);
  if (erro) {
    return res.render('generos-form', { tituloPagina: 'Novo gênero', acao: '/generos', genero: req.body, erro: erro });
  }
  try {
    await db.query('INSERT INTO generos (nome, descricao) VALUES (?, ?)', [req.body.nome.trim(), req.body.descricao]);
    res.redirect('/generos');
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.render('generos-form', { tituloPagina: 'Novo gênero', acao: '/generos', genero: req.body, erro: 'Já existe um gênero com esse nome.' });
    }
    console.error(e);
    res.status(500).send('Erro ao cadastrar gênero');
  }
});

// FORMULÁRIO EDITAR
router.get('/:id/editar', async (req, res) => {
  try {
    const [linhas] = await db.query('SELECT * FROM generos WHERE id = ?', [req.params.id]);
    if (linhas.length === 0) return res.status(404).send('Gênero não encontrado');
    res.render('generos-form', {
      tituloPagina: 'Editar gênero',
      acao: '/generos/' + req.params.id + '/editar',
      genero: linhas[0],
      erro: null
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao buscar gênero');
  }
});

// ATUALIZAR
router.post('/:id/editar', async (req, res) => {
  const acao = '/generos/' + req.params.id + '/editar';
  const erro = validar(req.body);
  if (erro) {
    return res.render('generos-form', { tituloPagina: 'Editar gênero', acao: acao, genero: req.body, erro: erro });
  }
  try {
    await db.query('UPDATE generos SET nome = ?, descricao = ? WHERE id = ?', [req.body.nome.trim(), req.body.descricao, req.params.id]);
    res.redirect('/generos');
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.render('generos-form', { tituloPagina: 'Editar gênero', acao: acao, genero: req.body, erro: 'Já existe um gênero com esse nome.' });
    }
    console.error(e);
    res.status(500).send('Erro ao atualizar gênero');
  }
});

// EXCLUIR (os filmes desse gênero ficam "sem gênero")
router.post('/:id/excluir', async (req, res) => {
  try {
    await db.query('DELETE FROM generos WHERE id = ?', [req.params.id]);
    res.redirect('/generos');
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao excluir gênero');
  }
});

module.exports = router;
