const mysql = require('mysql2/promise');

// Conexão com o MySQL (os mesmos dados que você usa no MySQL Workbench).
// Troque a senha pela sua.
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'sua_senha_aqui',
  database: 'tarantino',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true // datas chegam como texto 'AAAA-MM-DD'
});

module.exports = pool;
