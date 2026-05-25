#!/bin/bash
mongoimport --host localhost --db leituras --collection livros --type json --file /docker-entrypoint-initdb.d/livros.json --jsonArray

echo "Import concluído."
