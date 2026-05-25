#!/bin/bash
# Importa o dataset de jogos para a base de dados jogostabuleiro, coleção jogos
mongoimport --host localhost --db jogostabuleiro --collection jogos --type json --file /docker-entrypoint-initdb.d/jogos.json --jsonArray

echo "Import concluído."