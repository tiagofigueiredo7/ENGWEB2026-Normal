const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leituras'

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Ligado ao MongoDB'))
    .catch(err => console.error('Erro de ligação:', err))

const livrosRouter = require('./routes/livros')
app.use('/api', livrosRouter)

app.listen(19020, () => console.log('API disponível em http://localhost:19020'))
