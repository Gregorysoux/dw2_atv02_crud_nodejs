-- Rode este script inteiro no MySQL Workbench (ícone de raio).
-- Atenção: ele apaga e recria as tabelas, voltando aos dados iniciais do site.

CREATE DATABASE IF NOT EXISTS tarantino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tarantino;

DROP TABLE IF EXISTS filme_ator;
DROP TABLE IF EXISTS filmes;
DROP TABLE IF EXISTS atores;
DROP TABLE IF EXISTS generos;

CREATE TABLE generos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

CREATE TABLE atores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  nacionalidade VARCHAR(50),
  nascimento DATE
);

-- Relacionamento 1:N -> cada filme tem 1 gênero (um gênero tem vários filmes)
CREATE TABLE filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  ano INT NOT NULL,
  classificacao VARCHAR(20),
  genero_id INT NULL,
  FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE SET NULL
);

-- Relacionamento N:N -> um filme tem vários atores e um ator está em vários filmes
CREATE TABLE filme_ator (
  filme_id INT NOT NULL,
  ator_id INT NOT NULL,
  PRIMARY KEY (filme_id, ator_id),
  FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE,
  FOREIGN KEY (ator_id) REFERENCES atores(id) ON DELETE CASCADE
);

-- Dados iniciais (os mesmos que estavam nos arquivos da pasta data/)
INSERT INTO generos (id, nome, descricao) VALUES
  (1, 'Crime', 'histórias envolvendo gângsteres, assaltos e submundo do crime'),
  (2, 'Faroeste', 'ambientado no velho oeste americano, com pistoleiros e vingança'),
  (3, 'Suspense', 'enredo tenso que prende o espectador até o final'),
  (4, 'Drama', 'foco em conflitos pessoais e emocionais dos personagens'),
  (5, 'Guerra', 'histórias passadas em cenários de conflitos armados');

INSERT INTO atores (id, nome, nacionalidade, nascimento) VALUES
  (1, 'Samuel L. Jackson', 'Americana', '1948-12-21'),
  (2, 'Uma Thurman', 'Americana', '1970-04-29'),
  (3, 'John Travolta', 'Americana', '1954-02-18'),
  (4, 'Christoph Waltz', 'Austríaca', '1956-10-04'),
  (5, 'Leonardo DiCaprio', 'Americana', '1974-11-11'),
  (6, 'Tim Roth', 'Britânica', '1961-05-14');

INSERT INTO filmes (id, titulo, ano, classificacao, genero_id) VALUES
  (1, 'Cães de Aluguel', 1992, '18 anos', 1),
  (2, 'Pulp Fiction', 1994, '18 anos', 1),
  (3, 'Kill Bill: Volume 1', 2003, '16 anos', 3),
  (4, 'Bastardos Inglórios', 2009, '16 anos', 5),
  (5, 'Django Livre', 2012, '16 anos', 2),
  (6, 'Os Oito Odiados', 2015, '18 anos', 2);

INSERT INTO filme_ator (filme_id, ator_id) VALUES
  (1, 6),
  (2, 1), (2, 2), (2, 3), (2, 6),
  (3, 2),
  (4, 4),
  (5, 1), (5, 4), (5, 5),
  (6, 1), (6, 6);
