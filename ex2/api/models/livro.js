const mongoose = require('mongoose')

const livroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    paginas: { type: Number, required: true },
    genero: { type: String, required: true },
    lido: { type: Boolean, default: false }
})

livroSchema.index({ titulo: 'text', autor: 'text' })

module.exports = mongoose.model('Livro', livroSchema)
