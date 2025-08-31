const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const router = express.Router();
const logger = require('../logger');

// Route pour servir la page QR
router.get('/', (req, res) => {
    try {
        logger.info('Accès à la page QR code');
        res.sendFile(path.join(__dirname, '../qr.html'));
    } catch (error) {
        logger.error(`Erreur serveur QR: ${error.message}`);
        res.status(500).send('Erreur interne du serveur');
    }
});

// API pour générer un QR code (optionnel)
router.post('/generate', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({
                error: 'Données manquantes',
                message: 'Le paramètre "data" est requis'
            });
        }

        logger.info(`Génération QR code pour: ${data.substring(0, 20)}...`);
        
        // Générer le QR code
        const qrCodeDataURL = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            width: 500,
            margin: 1
        });

        res.json({
            success: true,
            qrCode: qrCodeDataURL,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`Erreur génération QR: ${error.message}`);
        res.status(500).json({
            error: 'Erreur de génération',
            message: 'Impossible de générer le QR code'
        });
    }
});

// API pour vérifier l'état de connexion (simulé)
router.get('/status', (req, res) => {
    try {
        // Simulation d'état de connexion
        const statuses = ['pending', 'scanning', 'connected', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        logger.info(`Vérification statut QR: ${randomStatus}`);
        
        res.json({
            status: randomStatus,
            timestamp: new Date().toISOString(),
            message: randomStatus === 'connected' ? 'Connexion réussie' : 
                     randomStatus === 'scanning' ? 'QR code détecté' :
                     randomStatus === 'failed' ? 'Échec de connexion' : 'En attente'
        });

    } catch (error) {
        logger.error(`Erreur statut QR: ${error.message}`);
        res.status(500).json({
            error: 'Erreur de statut',
            message: 'Impossible de récupérer le statut'
        });
    }
});

// Route pour servir les ressources statiques de la page QR
router.get('/resources/:filename', (req, res) => {
    const filename = req.params.filename;
    const allowedFiles = ['style.css', 'script.js', 'logo.png'];
    
    if (allowedFiles.includes(filename)) {
        try {
            const filePath = path.join(__dirname, '../public', filename);
            if (fs.existsSync(filePath)) {
                logger.info(`Fichier ressource servi: ${filename}`);
                res.sendFile(filePath);
            } else {
                logger.warn(`Fichier ressource non trouvé: ${filename}`);
                res.status(404).send('Fichier non trouvé');
            }
        } catch (error) {
            logger.error(`Erreur ressource ${filename}: ${error.message}`);
            res.status(500).send('Erreur de lecture du fichier');
        }
    } else {
        logger.warn(`Tentative d'accès ressource non autorisé: ${filename}`);
        res.status(403).send('Accès non autorisé');
    }
});

// Gestion des erreurs 404 pour les routes QR
router.use((req, res) => {
    logger.warn(`Route QR non trouvée: ${req.originalUrl}`);
    res.status(404).send('Page non trouvée');
});

// Middleware de gestion d'erreurs
router.use((err, req, res, next) => {
    logger.error(`Erreur route QR: ${err.stack}`);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

module.exports = router;
