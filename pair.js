const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const pino = require("pino");
const { 
    makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

// Configuration du logger
const logger = pino({ level: "error" }).child({ level: "error" });

// Fonction pour supprimer les fichiers temporaires
function removeSessionFiles(sessionPath) {
    if (fs.existsSync(sessionPath)) {
        try {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            logger.info(`Session files removed: ${sessionPath}`);
        } catch (error) {
            logger.error(`Error removing session files: ${error.message}`);
        }
    }
}

// Fonction pour générer un nom de session aléatoire
function generateSessionId() {
    const prefix = "PATERSON-";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = prefix;
    for (let i = 0; i < 10; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Route principale
router.get('/', async (req, res) => {
    const sessionId = generateSessionId();
    const sessionPath = path.join(__dirname, 'temp', sessionId);
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

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            generateHighQualityLinkPreview: true,
            logger: logger,
            syncFullHistory: false,
            browser: Browsers.macOS("Safari")
        });

        // Gestion des mises à jour des credentials
        sock.ev.on('creds.update', saveCreds);

        // Gestion des événements de connexion
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                try {
                    await delay(2000);
                    
                    // Vérification d'enregistrement
                    if (!sock.authState.creds.registered) {
                        const code = await sock.requestPairingCode(num);
                        return res.json({ code });
                    }

                    // Upload de la session
                    const credsPath = path.join(sessionPath, 'creds.json');
                    const megaUrl = await upload(fs.createReadStream(credsPath), `${sessionId}.json`);
                    const sessionKey = megaUrl.replace('https://mega.nz/file/', '');

                    // Message de succès
                    const successMsg = `✅ Votre session a été créée avec succès!\n\n` +
                        `🔒 *Session ID:* ${sessionKey}\n` +
                        `⚠️ *Gardez cette information secrète!*\n\n` +
                        `*🔗 Lien de la session:* ${megaUrl}\n\n` +
                        `_Rejoignez notre chaîne pour les mises à jour:_\n` +
                        `https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20`;

                    await sock.sendMessage(sock.user.id, { text: successMsg });
                    
                } catch (uploadError) {
                    logger.error(`Upload error: ${uploadError.message}`);
                    await sock.sendMessage(sock.user.id, { 
                        text: `❌ Erreur lors de la création de la session\n\n` +
                              `_Erreur:_ ${uploadError.message}\n\n` +
                              `Veuillez réessayer ou contacter le support.`
                    });
                } finally {
                    // Fermeture propre
                    await sock.ws.close();
                    removeSessionFiles(sessionPath);
                    logger.info(`Session ${sessionId} fermée proprement`);
                }
            } 
            else if (connection === "close" && lastDisconnect?.error) {
                const statusCode = lastDisconnect.error.output?.statusCode;
                if (statusCode !== 401) {
                    logger.warn(`Reconnexion pour ${sessionId}`);
                    removeSessionFiles(sessionPath);
                }
            }
        });
    } catch (mainError) {
        logger.error(`Main error: ${mainError.message}`);
        removeSessionFiles(sessionPath);
        
        if (!res.headersSent) {
            return res.status(500).json({ 
                error: "Service indisponible", 
                message: "Erreur lors du traitement de votre requête" 
            });
        }
    }
});

module.exports = router;
