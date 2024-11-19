# Utiliser une image Node.js pour le backend
FROM node:18-alpine

# Définir le répertoire de travail pour l'application backend
WORKDIR /app

# Cloner le dépôt GitHub du backend
#RUN git clone https://github.com/xavier-massart-vinci/3BIN-Web3-Project-Back.git .

# Copier le package.json et package-lock.json pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances du backend
RUN npm install --production

# Copier le reste des fichiers du backend
COPY . .

# Exposer le port 4000 pour le backend
EXPOSE 3000

# Démarrer le serveur Node.js
CMD ["npm", "run", "start"]