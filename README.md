# ENGWEB2026-Normal

Exame de época normal — Engenharia Web (3º ano LEI)
Data: 25 de Maio de 2026

---

## Estrutura do repositório

```
ENGWEB2026-Normal/
├── ex1/   # Exercício 1 — API de dados de Jogos de Tabuleiro
└── ex2/   # Exercício 2 — Engenharia Reversa: Lista de Leituras
```

---

## Exercício 1 — API de dados: Jogos de Tabuleiro

### Persistência de dados

O dataset (`ex1/jogos.json`) contém 27 jogos de tabuleiro com a seguinte estrutura por documento:

```json
{
  "id": "catan",
  "name": "Catan",
  "year": 1995,
  "category": "Family",
  "minPlayers": 3,
  "maxPlayers": 4,
  "playingTimeMinutes": 120,
  "descriptionEN": "...",
  "autores":   [ { "id": "...", "name": "..." } ],
  "editoras":  [ { "id": "...", "name": "...", "country": "..." } ],
  "mecanicas": [ { "id": "...", "name": "..." } ],
  "premios":   [ { "id": "...", "name": "...", "year": 0 } ]
}
```

Os dados são persistidos em **MongoDB** numa base de dados chamada `jogostabuleiro`, coleção `jogos`. O campo `id` (string) é único e é usado como identificador nas rotas da API em substituição do `_id` gerado pelo MongoDB.

O dataset é importado automaticamente no arranque do contentor MongoDB através do script `ex1/mongo-init/import.sh`, que usa `mongoimport`. A imagem mongo é construída a partir do `Dockerfile.mongo`, que copia o dataset e o script de inicialização para `/docker-entrypoint-initdb.d/` — diretoria que o MongoDB executa automaticamente na primeira inicialização.

### Setup e execução (Docker — recomendado)

Requer: **Docker** e **Docker Compose**.

```bash
cd ex1
docker compose up -d --build
```

Serviços iniciados:
- **MongoDB** — interno, não exposto ao exterior
- **API** — http://localhost:17000

Para parar:
```bash
docker compose down
```

Para apagar também os dados persistidos:
```bash
docker compose down -v
```

### Rotas disponíveis

A API responde na porta **17000**.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/jogos` | Lista todos os jogos (`id`, `name`, `year`, `category`, `minPlayers`) |
| GET | `/jogos?editora=EEEE` | Lista jogos filtrados pelo nome da editora (`id`, `name`, `year`) |
| GET | `/jogos/:id` | Devolve toda a informação do jogo com o `id` indicado |
| GET | `/autores` | Lista de autores ordenada alfabeticamente, sem repetições, com os seus jogos |
| GET | `/categorias` | Lista de categorias ordenada alfabeticamente, sem repetições, com os seus jogos |
| POST | `/jogos` | Cria um novo jogo (body JSON com os campos do schema) |
| PUT | `/jogos/:id` | Atualiza o jogo com o `id` indicado (body JSON com os campos a alterar) |
| DELETE | `/jogos/:id` | Remove o jogo com o `id` indicado |

Interface Swagger disponível em: http://localhost:17000/api-docs

### Queries MongoDB (1.2)

As queries encontram-se em `ex1/queries.txt`. Para as executar manualmente, ligar ao MongoDB:

```bash
# Dentro do contentor Docker:
docker exec -it jogos_mongo sh
mongosh
show dbs
use jogostabuleiro
```

**Q1 — Quantos jogos estão registados?**
```js
db.jogos.countDocuments()
```

**Q2 — Quantos jogos pertencem à categoria "Family"?**
```js
db.jogos.countDocuments({ category: "Family" })
```

**Q3 — Lista de autores (ordenada alfabeticamente, sem repetições)?**
```js
db.jogos.aggregate([
  { $unwind: "$autores" },
  { $group: { _id: "$autores.id", name: { $first: "$autores.name" } } },
  { $sort: { name: 1 } },
  { $project: { _id: 0, name: 1 } }
])
```

**Q4 — Distribuição de jogos por ano de lançamento?**
```js
db.jogos.aggregate([
  { $group: { _id: "$year", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
```

**Q5 — Distribuição de jogos por editora?**
```js
db.jogos.aggregate([
  { $unwind: "$editoras" },
  { $group: { _id: "$editoras.name", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
```

---

## Exercício 2 — Engenharia Reversa: A Minha Lista de Leituras

### Persistência de dados

Os dados são persistidos em **MongoDB** numa base de dados chamada `leituras`, coleção `livros`.

O modelo de dados (Mongoose) foi derivado a partir da análise do `index.html` e tem a seguinte estrutura:

```js
{
  titulo:  String,  // obrigatório
  autor:   String,  // obrigatório
  paginas: Number,  // obrigatório
  genero:  String,  // obrigatório
  lido:    Boolean  // default: false
}
```

Um índice de texto composto em `titulo` e `autor` suporta a pesquisa com `?search=X`.

O dataset inicial (`ex2/api/livros.json`) contém 7 registos exemplificativos e é importado automaticamente no arranque do contentor MongoDB, da mesma forma que no exercício 1: a imagem mongo é construída com o `Dockerfile.mongo` que copia o dataset e o script `mongo-init/import.sh` para `/docker-entrypoint-initdb.d/`.

### Arquitetura dos serviços
O MongoDB **não está exposto** ao exterior — apenas a API (na mesma rede interna) lhe pode aceder. O Nginx serve o ficheiro `index.html` estático e não partilha rede com o MongoDB.

### Setup e execução (Docker — recomendado)

Requer: **Docker** e **Docker Compose**.

```bash
cd ex2
docker compose up -d --build
```

Serviços iniciados:
- **MongoDB** — interno, sem porta exposta
- **API** — http://localhost:19020
- **Interface (Nginx)** — http://localhost:19021

Para parar:
```bash
docker compose down
```

Para apagar também os dados persistidos:
```bash
docker compose down -v
```

### Rotas da API

A API responde na porta **19020**.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/livros` | Lista todos os livros |
| GET | `/api/livros?search=X` | Lista livros cujo título ou autor contenha `X` |
| POST | `/api/livros` | Cria um novo livro (`titulo`, `autor`, `paginas`, `genero`) |
| PUT | `/api/livros/:id` | Altera o estado `lido` (boolean) do livro identificado pelo `_id` |
| DELETE | `/api/livros/:id` | Remove o livro identificado pelo `_id` |


### Interface Web

Abrir http://localhost:19021 no browser. A interface Vue.js comunica automaticamente com a API em `http://localhost:19020/api/livros` e permite:
- Visualizar a lista de livros
- Pesquisar por título ou autor em tempo real
- Adicionar um novo livro
- Marcar/desmarcar como lido
- Eliminar um livro
