const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// necessário para ler os dados dos formulários (req.body)
app.use(express.urlencoded({ extended: true }));

// função disponível em todas as views: '1948-12-21' -> '21/12/1948'
app.locals.formatarData = function (data) {
  if (!data) return '';
  const partes = String(data).split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
};

const indexRoutes = require('./routes/index');
const filmesRoutes = require('./routes/filmes');
const atoresRoutes = require('./routes/atores');
const generosRoutes = require('./routes/generos');

app.use('/', indexRoutes);
app.use('/filmes', filmesRoutes);
app.use('/atores', atoresRoutes);
app.use('/generos', generosRoutes);

const porta = 3000;
app.listen(porta, () => {
  console.log('rodando na porta ' + porta);
});
