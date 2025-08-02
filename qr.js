<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Générateur QR pour WhatsApp</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      background: linear-gradient(135deg, #0c2461, #1e3799, #0c2461);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      padding: 20px;
      overflow-x: hidden;
      position: relative;
    }
    
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(255,255,255,0.05) 0%, transparent 20%);
      pointer-events: none;
      z-index: -1;
    }
    
    .container {
      width: 100%;
      max-width: 900px;
      background: rgba(8, 14, 44, 0.92);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: linear-gradient(90deg, #0c2461, #1e3799);
      padding: 25px;
      text-align: center;
      position: relative;
      overflow: hidden;
      border-bottom: 3px solid #ffd700;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08) 0%, transparent 40%);
    }
    
    .logo {
      font-size: 3.2rem;
      margin-bottom: 15px;
      color: #ffd700;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-top: 10px;
      max-width: 600px;
      margin: 10px auto 0;
    }
    
    .content {
      display: flex;
      flex-wrap: wrap;
      padding: 30px;
      gap: 30px;
    }
    
    .panel {
      flex: 1;
      min-width: 300px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 15px;
      padding: 25px;
      border: 1px solid rgba(255, 215, 0, 0.2);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    .panel-title {
      font-size: 1.6rem;
      margin-bottom: 20px;
      color: #ffd700;
      border-bottom: 2px solid rgba(255, 215, 0, 0.3);
      padding-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .panel-title i {
      font-size: 1.8rem;
    }
    
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }
    
    #qrcode {
      width: 250px;
      height: 250px;
      background: white;
      padding: 15px;
      border-radius: 12px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
    }
    
    #qrcode img {
      max-width: 100%;
      max-height: 100%;
    }
    
    .instructions {
      margin-top: 25px;
    }
    
    .step {
      display: flex;
      margin-bottom: 20px;
      align-items: flex-start;
    }
    
    .step-number {
      background: #ffd700;
      color: #0c2461;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 15px;
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
    }
    
    .step-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #ffd700;
      font-size: 1.2rem;
    }
    
    .btn {
      background: linear-gradient(90deg, #1e3799, #0c2461);
      color: white;
      border: none;
      padding: 16px 30px;
      border-radius: 10px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 1px;
      box-shadow: 0 5px 20px rgba(28, 55, 153, 0.5);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 1px solid rgba(255, 215, 0, 0.3);
      margin-top: 15px;
    }
    
    .btn:hover {
      transform: translateY(-3px);
      background: linear-gradient(90deg, #0c2461, #1e3799);
      box-shadow: 0 8px 25px rgba(28, 55, 153, 0.7);
    }
    
    .btn:active {
      transform: translateY(1px);
    }
    
    .status-container {
      margin-top: 20px;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      font-size: 1.1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px dashed rgba(255, 215, 0, 0.3);
    }
    
    #status {
      font-weight: bold;
      color: #ffd700;
      margin-top: 5px;
      font-size: 1.2rem;
    }
    
    .countdown {
      font-size: 1.5rem;
      margin: 10px 0;
      color: #ffd700;
      font-weight: bold;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(0, 0, 0, 0.3);
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    
    .spinner {
      width: 60px;
      height: 60px;
      border: 6px solid rgba(255, 215, 0, 0.3);
      border-top: 6px solid #ffd700;
      border-radius: 50%;
      animation: spin 1.5s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .content {
        flex-direction: column;
      }
      
      .header {
        padding: 20px 15px;
      }
      
      .logo {
        font-size: 2.5rem;
      }
      
      h1 {
        font-size: 1.8rem;
      }
      
      .subtitle {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <i class="fas fa-qrcode"></i>
      </div>
      <h1>Générateur de QR Code WhatsApp</h1>
      <div class="subtitle">
        Connectez votre compte WhatsApp à votre bot en scannant le QR code
      </div>
    </div>
    
    <div class="content">
      <div class="panel">
        <h2 class="panel-title"><i class="fas fa-mobile-alt"></i> Scanner le QR Code</h2>
        
        <div class="qr-container">
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Génération du QR code en cours...</p>
          </div>
          <div id="qrcode"></div>
          
          <div class="countdown" id="countdown">Le QR code expire dans: 02:00</div>
          
          <button class="btn" id="generateBtn">
            <i class="fas fa-sync-alt"></i> Générer un Nouveau QR Code
          </button>
          
          <div class="status-container">
            <p>Statut de connexion:</p>
            <p id="status">En attente de scan...</p>
          </div>
        </div>
      </div>
      
      <div class="panel">
        <h2 class="panel-title"><i class="fas fa-info-circle"></i> Instructions de Connexion</h2>
        
        <div class="instructions">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Ouvrez WhatsApp</div>
              <p>Sur votre téléphone, ouvrez l'application WhatsApp.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Accédez aux Paramètres</div>
              <p>Appuyez sur les trois points en haut à droite, puis sélectionnez "Appareils connectés".</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Scanner le QR Code</div>
              <p>Appuyez sur "Lier un appareil" et scannez le code QR affiché à gauche.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <div class="step-title">Confirmez la Connexion</div>
              <p>Suivez les instructions à l'écran pour confirmer la connexion à votre bot.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">5</div>
            <div class="step-content">
              <div class="step-title">Utilisez le Bot</div>
              <p>Une fois connecté, vous pouvez commencer à utiliser les commandes du bot.</p>
            </div>
          </div>
        </div>
        
        <div class="status-container" style="margin-top: 30px; background: rgba(210, 16, 52, 0.2);">
          <p><i class="fas fa-exclamation-triangle"></i> Important:</p>
          <p>Le QR code expire après 2 minutes. Gardez cette page ouverte pendant le scan.</p>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>PATERSON-SESSION &copy; <span id="currentYear"></span> | Développé par Kervens</p>
      <p>Connexion WhatsApp sécurisée | v1.0</p>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const qrcodeDiv = document.getElementById('qrcode');
      const generateBtn = document.getElementById('generateBtn');
      const statusElement = document.getElementById('status');
      const countdownElement = document.getElementById('countdown');
      const loadingElement = document.getElementById('loading');
      
      // Set current year in footer
      document.getElementById('currentYear').textContent = new Date().getFullYear();
      
      // Fonction pour générer un QR code aléatoire
      function generateRandomQR() {
        // Masquer le QR code précédent et afficher le loader
        qrcodeDiv.innerHTML = '';
        loadingElement.style.display = 'flex';
        statusElement.textContent = 'Génération en cours...';
        
        // Simuler un délai de génération
        setTimeout(() => {
          // Générer une chaîne aléatoire pour le QR code
          const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          // Générer le QR code
          QRCode.toDataURL(randomString, {
            errorCorrectionLevel: 'H',
            width: 500,
            margin: 1
          }, function(err, url) {
            if (err) {
              console.error(err);
              statusElement.textContent = 'Erreur de génération';
              loadingElement.style.display = 'none';
              return;
            }
            
            // Afficher le QR code
            const img = document.createElement('img');
            img.src = url;
            qrcodeDiv.appendChild(img);
            
            // Cacher le loader
            loadingElement.style.display = 'none';
            
            // Mettre à jour le statut
            statusElement.textContent = 'En attente de scan...';
            statusElement.style.color = '#ffd700';
            
            // Démarrer le compte à rebours
            startCountdown();
          });
        }, 1500);
      }
      
      // Compte à rebours
      function startCountdown() {
        let timeLeft = 120; // 2 minutes en secondes
        
        const countdownInterval = setInterval(() => {
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = 'QR code expiré!';
            statusElement.textContent = 'QR code expiré - Veuillez en générer un nouveau';
            statusElement.style.color = '#ff6b6b';
          } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `Le QR code expire dans: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timeLeft--;
          }
        }, 1000);
      }
      
      // Simuler la connexion après le scan
      function simulateConnection() {
        setTimeout(() => {
          // 30% de chance que le scan échoue
          if (Math.random() < 0.3) {
            statusElement.textContent = 'Échec du scan - Veuillez réessayer';
            statusElement.style.color = '#ff6b6b';
          } else {
            statusElement.textContent = 'Connexion réussie! ✅';
            statusElement.style.color = '#4cd964';
            countdownElement.textContent = 'Connexion établie avec succès';
            
            // Afficher un message de succès
            setTimeout(() => {
              alert('Connexion WhatsApp réussie! Vous pouvez maintenant utiliser le bot.');
            }, 500);
          }
        }, 5000); // Simuler un délai de scan
      }
      
      // Gestionnaire d'événement pour le bouton de génération
      generateBtn.addEventListener('click', generateRandomQR);
      
      // Simuler un scan lorsqu'on clique sur le QR code
      qrcodeDiv.addEventListener('click', function() {
        if (statusElement.textContent === 'En attente de scan...') {
          statusElement.textContent = 'Détection du scan...';
          simulateConnection();
        }
      });
      
      // Générer le premier QR code au chargement
      generateRandomQR();
    });
  </script>
</body>
</html>
