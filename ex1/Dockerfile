FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY app.js ./
COPY swagger.yaml ./

EXPOSE 17000

CMD ["node", "app.js"]
