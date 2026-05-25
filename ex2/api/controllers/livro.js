const Livro = require('../models/livro')

const livroController = {
    getAll: async function(req, res) {
        try {
            let query = {}
            if (req.query.search) {
                query = { $text: { $search: req.query.search } }
            }
            const livros = await Livro.find(query)
            res.json(livros)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    create: async function(req, res) {
        try {
            const livro = new Livro(req.body)
            await livro.save()
            res.status(201).json(livro)
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    },

    updateLido: async function(req, res) {
        try {
            const livro = await Livro.findByIdAndUpdate(
                req.params.id,
                { lido: req.body.lido },
                { new: true }
            )
            if (!livro) return res.status(404).json({ message: 'Livro não encontrado.' })
            res.json(livro)
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    },

    delete: async function(req, res) {
        try {
            const livro = await Livro.findByIdAndDelete(req.params.id)
            if (!livro) return res.status(404).json({ message: 'Livro não encontrado.' })
            res.json({ message: 'Livro eliminado com sucesso.' })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

module.exports = livroController
