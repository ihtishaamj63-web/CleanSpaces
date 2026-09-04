FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
