const express = require('express');
const app = express();
const path = require('path');
const logger = require('./logger');

// Charger les variables d'environnement
require('dotenv').config();

// Routes
const pairRouter = require('./routes/pair');
const qrRouter = require('./routes/qr');
const mainRouter = require('./routes/main');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(logger);

// Routes
app.use('/pair', pairRouter);
app.use('/qr', qrRouter);
app.use('/', mainRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Erreur serveur!');
});

// Nettoyage au démarrage
function cleanupOldSessions() {
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      
      // Supprimer les sessions vieilles de plus d'1 heure
      if (stat.isDirectory() && (Date.now() - stat.mtimeMs) > 3600000) {
        fs.rmSync(filePath, { recursive: true, force: true });
        logger.info(`Session ancienne supprimée: ${file}`);
      }
    });
  }
}

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  
  // Nettoyer les anciennes sessions
  cleanupOldSessions();
  
  // Planifier le nettoyage régulier
  setInterval(cleanupOldSessions, 3600000); // Toutes les heures
});
