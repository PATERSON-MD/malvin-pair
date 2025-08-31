const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const logger = require('../logger'); // Chemin correct

// Route principale - Page d'accueil
router.get('/', (req, res) => {
    try {
        logger.info('Accès à la page principale');
        res.sendFile(path.join(__dirname, '../main.html'));
    } catch (error) {
        logger.error(`Erreur serveur main: ${error.message}`);
        res.status(500).send('Erreur interne du serveur');
    }
});

// Route pour servir les fichiers statiques si nécessaire
router.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const allowedFiles = ['main.html', 'pair.html', 'qr.html', 'style.css', 'script.js'];
    
    if (allowedFiles.includes(filename)) {
        try {
            const filePath = path.join(__dirname, '..', filename);
            if (fs.existsSync(filePath)) {
                logger.info(`Fichier servi: ${filename}`);
                res.sendFile(filePath);
            } else {
                logger.warn(`Fichier non trouvé: ${filename}`);
                res.status(404).send('Fichier non trouvé');
            }
        } catch (error) {
            logger.error(`Erreur fichier ${filename}: ${error.message}`);
            res.status(500).send('Erreur de lecture du fichier');
        }
    } else {
        logger.warn(`Tentative d'accès non autorisé: ${filename}`);
        res.status(403).send('Accès non autorisé');
    }
});

// Route de santé de l'application
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Serveur fonctionnel',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Route pour les informations de l'API
router.get('/api/info', (req, res) => {
    res.json({
        name: 'PATERSON-pair',
        version: '1.0.0',
        description: 'Service de pairing WhatsApp',
        endpoints: {
            pair: '/pair?number=XXXXXXXXXX',
            qr: '/qr',
            health: '/health'
        }
    });
});

// Gestion des erreurs 404 pour les routes main
router.use((req, res) => {
    logger.warn(`Route non trouvée: ${req.originalUrl}`);
    res.status(404).send('Page non trouvée');
});

// Middleware de gestion d'erreurs
router.use((err, req, res, next) => {
    logger.error(`Erreur route main: ${err.stack}`);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

module.exports = router;
