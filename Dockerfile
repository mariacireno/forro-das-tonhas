FROM node:20-slim

WORKDIR /app

# Instala dependências nativas necessárias para better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Instala dependências do backend
COPY package*.json ./
RUN npm ci

# Instala e builda o frontend
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "start"]
