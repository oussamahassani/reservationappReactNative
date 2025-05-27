
/**
 * Middleware d'authentification
 * 
 * Ce fichier contient les middlewares pour la gestion de l'authentification
 * et des autorisations dans l'application.
 * 
 * @module middleware/auth
 */

const User = require('../models/userModel');

/**
 * Middleware de protection des routes
 * Vérifie si l'utilisateur est authentifié avant d'accéder aux routes protégées
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante dans la chaîne des middlewares
 */
exports.protect = async (req, res, next) => {
  try {
    // Récupération de l'ID utilisateur depuis la requête
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 401,
        message: 'Authentification requise. Veuillez fournir un userId.'
      });
    }
    
    // Recherche de l'utilisateur dans la base de données
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Ajout des informations utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

/**
 * Middleware de vérification des droits administrateur
 * Vérifie si l'utilisateur a le rôle 'admin'
 */
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 403,
      message: 'Accès refusé - Droits administrateur requis'
    });
  }
};

/**
 * Middleware de vérification des droits fournisseur
 * Vérifie si l'utilisateur a le rôle 'provider' ou 'admin'
 */
exports.provider = (req, res, next) => {
  if (req.user && (req.user.role === 'provider' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      status: 403,
      message: 'Accès refusé - Droits fournisseur requis'
    });
  }
};
