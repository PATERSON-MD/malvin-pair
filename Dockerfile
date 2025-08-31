FROM node:lts-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        imagemagick \
        webp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
  
WORKDIR /usr/src/app

COPY package.json .

RUN npm install && npm install -g qrcode-terminal pm2

COPY . .

# Ajoutez cette ligne pour vérifier si le fichier existe
RUN ls -la routes/ || echo "Dossier routes/ non trouvé"

EXPOSE 5000

CMD ["npm", "start"]
