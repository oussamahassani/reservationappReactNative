
/**
 * Contrôleur Clerk
 * 
 * Gère l'intégration avec le service d'authentification Clerk.
 * Responsable de la synchronisation des utilisateurs Clerk avec la base de données 
 * de l'application et de la gestion des événements de déconnexion.
 */
const User = require('../models/userModel');

/**
 * Synchroniser un utilisateur Clerk avec notre base de données
 * @desc    Synchronise un utilisateur Clerk avec notre base de données
 * @route   POST /api/clerk/sync
 * @access  Public
 */
exports.syncClerkUser = async (req, res) => {
  try {
    console.log('🔹 Synchronisation d\'un utilisateur Clerk');
    const { email, nom, prenom, phone, profileImage, oauth_id, oauth_provider } = req.body;
    console.log('👤 Données utilisateur reçues:', { email, nom, prenom, oauth_provider });
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findByEmail(email);
    
    if (userExists) {
      console.log(`✅ Utilisateur existant trouvé: ${userExists.user_id}`);
      // Renvoyer l'utilisateur existant
      return res.status(200).json({
        user_id: userExists.user_id,
        nom: userExists.nom,
        prenom: userExists.prenom,
        email: userExists.email,
        role: userExists.role
      });
    }
    
    // L'utilisateur n'existe pas, en créer un nouveau
    console.log('👤 Création d\'un nouvel utilisateur depuis Clerk');
    const userId = await User.create({
      nom: nom || '-',
      prenom: prenom || '-',
      email,
      password: 'mot-de-passe-simple', // Simplifié pour le développement
      role: 'utilisateur',
      status: 'actif',
      phone: phone || '-',
      profile_image: profileImage || null,
      oauth_id,
      oauth_provider
    });
    
    const user = await User.findById(userId);
    
    if (user) {
      console.log(`✅ Utilisateur Clerk créé avec succès: ${userId}`);
      res.status(201).json({
        user_id: user.user_id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('❌ Échec de la création de l\'utilisateur Clerk');
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error) {
    console.error('❌ Erreur de synchronisation Clerk:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Gérer l'événement de déconnexion Clerk
 * @desc    Gère l'événement de déconnexion Clerk
 * @route   POST /api/clerk/signout
 * @access  Public
 */
exports.handleClerkSignout = async (req, res) => {
  try {
    console.log('🔹 Déconnexion d\'un utilisateur Clerk');
    // Processus de déconnexion simplifié pour le développement
    console.log('✅ Déconnexion Clerk réussie');
    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('❌ Erreur de déconnexion Clerk:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
