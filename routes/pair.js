const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { DisconnectReason } = require('@whiskeysockets/baileys');
const logger = require('../logger'); // ✅ CHEMIN CORRIGÉ

// Configuration
const TEMP_DIR = path.join(__dirname, 'temp');
const SESSION_TIMEOUT = 180000; // 3 minutes

// Créer le répertoire temp s'il n'existe pas
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Fonction pour générer un ID de session
function makeid(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Fonction pour supprimer les fichiers temporaires
function removeSessionFiles(sessionPath) {
  if (fs.existsSync(sessionPath)) {
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      logger.info(`Fichiers de session supprimés: ${sessionPath}`);
    } catch (error) {
      logger.error(`Erreur de suppression: ${error.message}`);
    }
  }
}

// Route principale pour la génération de pairing code
router.get('/', async (req, res) => {
  const sessionId = makeid();
  const sessionPath = path.join(TEMP_DIR, sessionId);
  let num = req.query.number;
  
  // Vérification du numéro
  if (!num || num.replace(/\D/g, '').length < 8) {
    return res.status(400).json({ 
      error: "Numéro invalide", 
      message: "Veuillez fournir un numéro WhatsApp valide avec l'indicatif pays" 
    });
  }

  // Nettoyage du numéro
  num = num.replace(/\D/g, '');

  try {
    // Création du répertoire de session
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    // Importation dynamique de Baileys pour une meilleure gestion mémoire
    const { makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = await import('@whiskeysockets/baileys');
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
      logger: logger,
      browser: Browsers.macOS("Safari"),
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      getMessage: async () => null
    });

    // Timeout pour éviter les sessions bloquées
    const sessionTimer = setTimeout(async () => {
      logger.warn(`Session timeout: ${sessionId}`);
      try {
        await sock.ws.close();
      } catch (e) {
        logger.error(`Erreur de fermeture timeout: ${e.message}`);
      }
      removeSessionFiles(sessionPath);
      if (!res.headersSent) {
        res.status(504).json({ 
          error: "Timeout", 
          message: "La session a expiré" 
        });
      }
    }, SESSION_TIMEOUT);

    // Gestion des mises à jour des credentials
    sock.ev.on('creds.update', saveCreds);

    // Gestion des événements de connexion
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        logger.info(`Connexion ouverte pour la session: ${sessionId}`);
        clearTimeout(sessionTimer);
        
        try {
          // Vérification d'enregistrement
          if (!sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(num);
            logger.info(`Code de pairing généré pour ${num}: ${code}`);
            
            if (!res.headersSent) {
              res.json({ code });
            }
          } else {
            logger.warn(`Session déjà enregistrée: ${sessionId}`);
          }
        } catch (pairingError) {
          logger.error(`Erreur de pairing: ${pairingError.message}`);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: "Erreur de génération", 
              message: "Impossible de générer le code de pairing" 
            });
          }
        } finally {
          // Fermeture propre
          try {
            await sock.ws.close();
            removeSessionFiles(sessionPath);
            logger.info(`Session ${sessionId} fermée correctement`);
          } catch (closeError) {
            logger.error(`Erreur de fermeture: ${closeError.message}`);
          }
        }
      } 
      else if (connection === "close" && lastDisconnect?.error) {
        clearTimeout(sessionTimer);
        removeSessionFiles(sessionPath);
        
        const statusCode = lastDisconnect.error.output?.statusCode;
        
        if (statusCode === DisconnectReason.loggedOut) {
          logger.warn(`Déconnecté pour la session: ${sessionId}`);
        } else if (statusCode !== 401) {
          logger.warn(`Reconnexion nécessaire pour ${sessionId}`);
        }
        
        if (!res.headersSent) {
          res.status(500).json({ 
            error: "Connexion fermée", 
            message: "La connexion WhatsApp s'est fermée inopinément" 
          });
        }
      }
    });
  } catch (mainError) {
    logger.error(`Erreur principale: ${mainError.message}`);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Service indisponible", 
        message: "Erreur lors du traitement de votre requête" 
      });
    }
  }
});

module.exports = router;
