const express = require('express');
const router = express.Router();
const db = require('../db');

function validar(body) {
  if (!body.nome || body.nome.trim() === '') return 'Informe o nome do ator.';
  return null;
}

// LISTAR (mostra também os filmes de cada ator)
router.get('/', async (req, res) => {
  try {
    const [atores] = await db.query(
      `SELECT a.id, a.nome, a.nacionalidade, a.nascimento,
              GROUP_CONCAT(f.titulo ORDER BY f.ano SEPARATOR ', ') AS filmes
       FROM atores a
       LEFT JOIN filme_ator fa ON fa.ator_id = a.id
       LEFT JOIN filmes f ON f.id = fa.filme_id
       GROUP BY a.id, a.nome, a.nacionalidade, a.nascimento
       ORDER BY a.nome`
    );
    res.render('atores', { atores: atores });
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao listar atores');
  }
});

// FORMULÁRIO NOVO
router.get('/novo', (req, res) => {
  res.render('atores-form', {
    tituloPagina: 'Novo ator',
    acao: '/atores',
    ator: { nome: '', nacionalidade: '', nascimento: '' },
    erro: null
  });
});

// CRIAR
router.post('/', async (req, res) => {
  const erro = validar(req.body);
  if (erro) {
    return res.render('atores-form', { tituloPagina: 'Novo ator', acao: '/atores', ator: req.body, erro: erro });
  }
  try {
    await db.query(
      'INSERT INTO atores (nome, nacionalidade, nascimento) VALUES (?, ?, ?)',
      [req.body.nome.trim(), req.body.nacionalidade, req.body.nascimento || null]
    );
    res.redirect('/atores');
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao cadastrar ator');
  }
});

// FORMULÁRIO EDITAR
router.get('/:id/editar', async (req, res) => {
  try {
    const [linhas] = await db.query('SELECT * FROM atores WHERE id = ?', [req.params.id]);
    if (linhas.length === 0) return res.status(404).send('Ator não encontrado');
    res.render('atores-form', {
      tituloPagina: 'Editar ator',
      acao: '/atores/' + req.params.id + '/editar',
      ator: linhas[0],
      erro: null
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao buscar ator');
  }
});

// ATUALIZAR
router.post('/:id/editar', async (req, res) => {
  const erro = validar(req.body);
  if (erro) {
    return res.render('atores-form', {
      tituloPagina: 'Editar ator',
      acao: '/atores/' + req.params.id + '/editar',
      ator: req.body,
      erro: erro
    });
  }
  try {
    await db.query(
      'UPDATE atores SET nome = ?, nacionalidade = ?, nascimento = ? WHERE id = ?',
      [req.body.nome.trim(), req.body.nacionalidade, req.body.nascimento || null, req.params.id]
    );
    res.redirect('/atores');
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao atualizar ator');
  }
});

// EXCLUIR (as ligações com os filmes são removidas automaticamente)
router.post('/:id/excluir', async (req, res) => {
  try {
    await db.query('DELETE FROM atores WHERE id = ?', [req.params.id]);
    res.redirect('/atores');
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao excluir ator');
  }
});

module.exports = router;
