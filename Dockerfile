# Utiliser une image Node.js pour le backend
FROM node:18-alpine

# Définir le répertoire de travail pour l'application backend
WORKDIR /app

# Cloner le dépôt GitHub du backend
RUN git clone -b chore/build https://github.com/xavier-massart-vinci/3BIN-Web3-Project-Back.git .

# Se déplacer dans le dossier du backend
WORKDIR /app

# Copier le package.json et package-lock.json pour installer les dépendances
COPY ./package.json ./package-lock.json ./

# Installer les dépendances du backend
RUN npm install --production

# Copier le reste des fichiers du backend
COPY . .

# Exposer le port 4000 pour le backend
EXPOSE 4000

# Démarrer le serveur Node.js
CMD ["node", "index.js"]
