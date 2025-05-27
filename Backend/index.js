
/**
 * Point d'entrée principal de l'application JenCity
 * Ce fichier initialise le serveur Express et configure les routes principales
 * 
 * @module index
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires morgan
 */
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors/safe');

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration des middlewares principaux
app.use(cors()); // Activation du CORS pour les requêtes cross-origin
app.use(express.json()); // Parser pour les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parser pour les données de formulaire

// Activer la journalisation détaillée en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route racine - Point d'entrée de l'API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Bienvenue sur l\'API JendoubaLife',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Importation des routes de l'application
const userRoutes = require('./routes/userRoutes');         // Routes pour la gestion des utilisateurs
const placeRoutes = require('./routes/placeRoutes');      // Routes pour la gestion des lieux
const eventRoutes = require('./routes/eventRoutes');      // Routes pour la gestion des événements
const reviewRoutes = require('./routes/reviewRoutes');    // Routes pour la gestion des avis
const reservationRoutes = require('./routes/reservationRoutes'); // Routes pour la gestion des réservations
const promotionRoutes = require('./routes/promotionRoutes');    // Routes pour la gestion des promotions
const messagerieRoutes = require('./routes/messagerieRoutes'); // Routes pour la messagerie
const passwordRoutes = require('./routes/passwordRoutes'); // Routes pour la gestion des mots de passe

// Enregistrement des routes dans l'application
app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/messagerie', messagerieRoutes);
app.use('/api/password', passwordRoutes);

// Configuration des routes pour la documentation
app.use('/api-docs', express.static(path.join(__dirname, 'docs')));
app.use('/documentation', express.static(path.join(__dirname, 'documentation_api.html')));

// Middleware de gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({ 
    message: 'Erreur serveur', 
    error: err.message 
  });
});

// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Configuration du port d'écoute
const PORT = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`
  ╭────────────────────────────────────────────────╮
  │                                                │
  │   🚀 Serveur démarré sur le port ${PORT}           │
  │   🌐 http://localhost:${PORT}                      │
  │   📘 Documentation API: http://localhost:${PORT}/api-docs │
  │                                                │
  ╰────────────────────────────────────────────────╯
  `);
});

module.exports = app;
