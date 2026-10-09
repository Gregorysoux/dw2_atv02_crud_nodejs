const express = require('express');
const router = express.Router();
const db = require('../db');

// ---------- funções de apoio ----------

// gêneros e atores para o <select> e os checkboxes do formulário
async function carregarOpcoes() {
  const [generos] = await db.query('SELECT id, nome FROM generos ORDER BY nome');
  const [atores] = await db.query('SELECT id, nome FROM atores ORDER BY nome');
  return { generos: generos, atores: atores };
}

// os checkboxes chegam como texto (1 marcado) ou lista (vários marcados)
function lerAtores(body) {
  let lista = body.atores || [];
  if (!Array.isArray(lista)) lista = [lista];
  return lista.map(Number);
}

function validar(body) {
  if (!body.titulo || body.titulo.trim() === '') return 'Informe o título do filme.';
  const ano = Number(body.ano);
  if (!Number.isInteger(ano) || ano < 1888 || ano > 2100) return 'Informe um ano válido.';
  return null;
}

async function mostrarForm(res, dados) {
  const opcoes = await carregarOpcoes();
  res.render('filmes-form', Object.assign({ erro: null }, opcoes, dados));
}

// apaga as ligações antigas e grava as novas na tabela filme_ator
async function salvarAtores(conn, filmeId, listaAtores) {
  await conn.query('DELETE FROM filme_ator WHERE filme_id = ?', [filmeId]);
  if (listaAtores.length > 0) {
    const pares = listaAtores.map(function (atorId) { return [filmeId, atorId]; });
    await conn.query('INSERT INTO filme_ator (filme_id, ator_id) VALUES ?', [pares]);
  }
}

// ---------- rotas ----------

// LISTAR (junta filme + gênero + atores)
router.get('/', async (req, res) => {
  try {
    const [filmes] = await db.query(
      `SELECT f.id, f.titulo, f.ano, f.classificacao, g.nome AS genero,
              GROUP_CONCAT(a.nome ORDER BY a.nome SEPARATOR ', ') AS atores
       FROM filmes f
       LEFT JOIN generos g ON g.id = f.genero_id
       LEFT JOIN filme_ator fa ON fa.filme_id = f.id
       LEFT JOIN atores a ON a.id = fa.ator_id
       GROUP BY f.id, f.titulo, f.ano, f.classificacao, g.nome
       ORDER BY f.ano`
    );
    res.render('filmes', { filmes: filmes });
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao listar filmes');
  }
});

// FORMULÁRIO NOVO
router.get('/novo', async (req, res) => {
  try {
    await mostrarForm(res, {
      tituloPagina: 'Novo filme',
      acao: '/filmes',
      filme: { titulo: '', ano: '', classificacao: '', genero_id: '' },
      atoresDoFilme: []
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao abrir o formulário');
  }
});

// CRIAR
router.post('/', async (req, res) => {
  const atoresSel = lerAtores(req.body);
  const erro = validar(req.body);
  if (erro) {
    try {
      return await mostrarForm(res, { tituloPagina: 'Novo filme', acao: '/filmes', filme: req.body, atoresDoFilme: atoresSel, erro: erro });
    } catch (e) {
      console.error(e);
      return res.status(500).send('Erro ao abrir o formulário');
    }
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [resultado] = await conn.query(
      'INSERT INTO filmes (titulo, ano, classificacao, genero_id) VALUES (?, ?, ?, ?)',
      [req.body.titulo.trim(), req.body.ano, req.body.classificacao, req.body.genero_id || null]
    );
    await salvarAtores(conn, resultado.insertId, atoresSel);
    await conn.commit();
    res.redirect('/filmes');
  } catch (e) {
    if (conn) await conn.rollback();
    console.error(e);
    res.status(500).send('Erro ao cadastrar filme');
  } finally {
    if (conn) conn.release();
  }
});

// FORMULÁRIO EDITAR
router.get('/:id/editar', async (req, res) => {
  try {
    const [linhas] = await db.query('SELECT * FROM filmes WHERE id = ?', [req.params.id]);
    if (linhas.length === 0) return res.status(404).send('Filme não encontrado');

    const [ligacoes] = await db.query('SELECT ator_id FROM filme_ator WHERE filme_id = ?', [req.params.id]);
    await mostrarForm(res, {
      tituloPagina: 'Editar filme',
      acao: '/filmes/' + req.params.id + '/editar',
      filme: linhas[0],
      atoresDoFilme: ligacoes.map(function (l) { return l.ator_id; })
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao buscar filme');
  }
});

// ATUALIZAR
router.post('/:id/editar', async (req, res) => {
  const acao = '/filmes/' + req.params.id + '/editar';
  const atoresSel = lerAtores(req.body);
  const erro = validar(req.body);
  if (erro) {
    try {
      return await mostrarForm(res, { tituloPagina: 'Editar filme', acao: acao, filme: req.body, atoresDoFilme: atoresSel, erro: erro });
    } catch (e) {
      console.error(e);
      return res.status(500).send('Erro ao abrir o formulário');
    }
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    await conn.query(
      'UPDATE filmes SET titulo = ?, ano = ?, classificacao = ?, genero_id = ? WHERE id = ?',
      [req.body.titulo.trim(), req.body.ano, req.body.classificacao, req.body.genero_id || null, req.params.id]
    );
    await salvarAtores(conn, req.params.id, atoresSel);
    await conn.commit();
    res.redirect('/filmes');
  } catch (e) {
    if (conn) await conn.rollback();
    console.error(e);
    res.status(500).send('Erro ao atualizar filme');
  } finally {
    if (conn) conn.release();
  }
});

// EXCLUIR (as ligações com os atores são removidas automaticamente)
router.post('/:id/excluir', async (req, res) => {
  try {
    await db.query('DELETE FROM filmes WHERE id = ?', [req.params.id]);
    res.redirect('/filmes');
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao excluir filme');
  }
});

module.exports = router;
