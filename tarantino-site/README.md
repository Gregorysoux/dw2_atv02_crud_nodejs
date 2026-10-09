# Tarantino — site com CRUD (Node.js + Express + EJS + MySQL)

Mesmo site da Atividade 01, agora com banco de dados MySQL e CRUD completo
(cadastrar, listar, editar e excluir) de **filmes**, **atores** e **gêneros**.

## Como rodar

1. **Criar o banco:** abra o MySQL Workbench, abra o arquivo `database.sql`
   e execute tudo (ícone de raio). Ele cria o banco `tarantino`, as tabelas
   e já insere os dados que estavam na pasta `data/`.
2. **Configurar a conexão:** abra `db.js` e troque `sua_senha_aqui` pela senha
   do seu MySQL (usuário `root`, porta `3306`).
3. **Instalar e iniciar** (no terminal, dentro da pasta `tarantino-site`):

   ```
   npm install
   npm start
   ```

4. Abra no navegador: http://localhost:3000

## Estrutura

```
tarantino-site/
├─ app.js              -> configuração do Express (agora lê formulários)
├─ db.js               -> conexão com o MySQL (mysql2)
├─ database.sql        -> script que cria o banco, as tabelas e os dados iniciais
├─ routes/
│   ├─ index.js        -> página inicial (mostra os totais)
│   ├─ filmes.js       -> CRUD de filmes
│   ├─ atores.js       -> CRUD de atores
│   └─ generos.js      -> CRUD de gêneros
├─ views/
│   ├─ filmes.ejs / filmes-form.ejs
│   ├─ atores.ejs / atores-form.ejs
│   ├─ generos.ejs / generos-form.ejs
│   ├─ index.ejs
│   └─ partials/navbar.ejs
└─ public/style.css
```

A pasta `data/` (arrays em JavaScript) não é mais usada: os dados agora ficam no MySQL.

## Relacionamento entre tabelas

- **generos 1 — N filmes:** cada filme tem um gênero (`filmes.genero_id`).
  Se o gênero for excluído, os filmes dele ficam "sem gênero".
- **filmes N — N atores:** tabela de ligação `filme_ator`.
  Ao excluir um filme ou um ator, as ligações dele são apagadas automaticamente.

## Rotas

| Método | Rota                     | O que faz                    |
|--------|--------------------------|------------------------------|
| GET    | `/filmes`                | lista os filmes              |
| GET    | `/filmes/novo`           | formulário de cadastro       |
| POST   | `/filmes`                | grava o novo filme           |
| GET    | `/filmes/:id/editar`     | formulário de edição         |
| POST   | `/filmes/:id/editar`     | atualiza o filme             |
| POST   | `/filmes/:id/excluir`    | exclui o filme               |

`/atores` e `/generos` têm exatamente as mesmas rotas.
