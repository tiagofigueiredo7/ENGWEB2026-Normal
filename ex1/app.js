const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jogostabuleiro';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Ligado ao MongoDB'))
  .catch(err => console.error('Erro de ligação ao MongoDB:', err));

const jogoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  year: Number,
  category: String,
  minPlayers: Number,
  maxPlayers: Number,
  playingTimeMinutes: Number,
  descriptionEN: String,
  autores: [{ id: String, name: String }],
  editoras: [{ id: String, name: String, country: String }],
  mecanicas: [{ id: String, name: String }],
  premios: [{ id: String, name: String, year: Number }]
}, { collection: 'jogos' });

const Jogo = mongoose.model('Jogo', jogoSchema);

const swaggerDoc = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// GET /jogos  (suporta ?editora=EEEE)
app.get('/jogos', async (req, res) => {
  try {
    const { editora } = req.query;
    if (editora) {
      const jogos = await Jogo.find(
        { 'editoras.name': editora },
        { _id: 0, id: 1, name: 1, year: 1 }
      );
      return res.json(jogos);
    }
    const jogos = await Jogo.find({}, { _id: 0, id: 1, name: 1, year: 1, category: 1, minPlayers: 1 });
    res.json(jogos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /jogos/:id
app.get('/jogos/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findOne({ id: req.params.id }, { __v: 0 });
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(jogo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /autores
app.get('/autores', async (req, res) => {
  try {
    const result = await Jogo.aggregate([
      { $unwind: '$autores' },
      { $group: {
        _id: '$autores.name',
        jogos: { $push: { id: '$id', name: '$name' } }
      }},
      { $sort: { _id: 1 } },
      { $project: { _id: 0, autor: '$_id', jogos: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /categorias
app.get('/categorias', async (req, res) => {
  try {
    const result = await Jogo.aggregate([
      { $group: {
        _id: '$category',
        jogos: { $push: { id: '$id', name: '$name' } }
      }},
      { $sort: { _id: 1 } },
      { $project: { _id: 0, categoria: '$_id', jogos: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /jogos
app.post('/jogos', async (req, res) => {
  try {
    const jogo = new Jogo(req.body);
    await jogo.save();
    res.status(201).json(jogo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /jogos/:id
app.delete('/jogos/:id', async (req, res) => {
  try {
    const result = await Jogo.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json({ message: 'Jogo eliminado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /jogos/:id
app.put('/jogos/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(jogo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(17000, () => console.log('API disponível em http://localhost:17000'));
