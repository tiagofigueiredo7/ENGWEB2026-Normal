const express = require('express')
const router = express.Router()
const LivroController = require('../controllers/livro')

router.get('/livros', LivroController.getAll)
router.post('/livros', LivroController.create)
router.put('/livros/:id', LivroController.updateLido)
router.delete('/livros/:id', LivroController.delete)

module.exports = router
