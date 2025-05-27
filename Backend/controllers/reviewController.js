
const Review = require("../models/reviewModel");
const Place = require("../models/placeModel");
const { validationResult } = require("express-validator");

/**
 * Contrôleur des avis - Gère toutes les requêtes liées aux avis utilisateurs
 */

/**
 * Récupère tous les avis avec filtres optionnels
 * @route GET /api/reviews
 */
exports.getAllReviews = async (req, res) => {
  try {
    // Récupération de tous les avis avec filtres optionnels
    const reviews = await Review.getAll(req.query);
    res.status(200).json({
      status: 200,
      data: reviews
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ 
      status: 500,
      message: error.message 
    });
  }
};

/**
 * Récupère les avis pour un lieu spécifique
 * @route GET /api/reviews/place/:placeId
 */
exports.getReviewsByPlace = async (req, res) => {
  try {
    // Récupération de l'identifiant du lieu depuis les paramètres
    const placeId = req.params.placeId;
    // Récupération des avis pour ce lieu
    const reviews = await Review.getByPlaceId(placeId);
    
    // Calcul de la note moyenne
    const ratingData = await Review.getAverageRatingForPlace(placeId);
    
    // Réponse avec les avis et les statistiques
    res.status(200).json({
      status: 200,
      data: {
        reviews,
        averageRating: ratingData.averageRating,
        reviewCount: ratingData.reviewCount
      }
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ 
      status: 500,
      message: error.message 
    });
  }
};

/**
 * Récupère les avis d'un utilisateur spécifique
 * @route GET /api/reviews/user/:userId
 */
exports.getReviewsByUser = async (req, res) => {
  try {
    // Récupération de l'identifiant de l'utilisateur depuis les paramètres
    const userId = req.params.userId;
    // Récupération des avis de cet utilisateur
    const reviews = await Review.getByUserId(userId);
    
    // Réponse avec les avis
    res.status(200).json({
      status: 200,
      data: reviews
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ 
      status: 500,
      message: error.message 
    });
  }
};

/**
 * Récupère un avis par son identifiant
 * @route GET /api/reviews/:id
 */
exports.getReviewById = async (req, res) => {
  try {
    // Récupération de l'avis par son identifiant
    const review = await Review.getById(req.params.id);
    
    // Vérification si l'avis existe
    if (!review) {
      return res.status(404).json({ 
        status: 404,
        message: "Review not found" 
      });
    }
    
    // Réponse avec l'avis
    res.status(200).json({
      status: 200,
      data: review
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ 
      status: 500,
      message: error.message 
    });
  }
};

/**
 * Crée un nouvel avis
 * @route POST /api/reviews
 */
exports.createReview = async (req, res) => {
  // Validation des données d'entrée
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 400,
      errors: errors.array() 
    });
  }

  try {
    // Ajout de l'identifiant utilisateur depuis l'authentification si non fourni
    if (!req.body.userId && req.user) {
      req.body.userId = req.user.id;
    }

    // Vérification si le lieu existe
    const place = await Place.getById(req.body.placeId);
    if (!place) {
      return res.status(404).json({ 
        status: 404,
        message: "Place not found" 
      });
    }

    // Création de l'avis
    const reviewId = await Review.create(req.body);
    // Récupération de l'avis créé
    const review = await Review.getById(reviewId);
    
    // Réponse avec l'avis créé
    res.status(201).json({
      status: 201,
      message: "Review successfully submitted",
      data: review
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(400).json({ 
      status: 400,
      message: error.message 
    });
  }
};

/**
 * Met à jour un avis existant
 * @route PUT /api/reviews/:id
 */
exports.updateReview = async (req, res) => {
  // Validation des données d'entrée
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 400,
      errors: errors.array() 
    });
  }

  try {
    // Vérification si l'avis existe
    const review = await Review.getById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        status: 404,
        message: "Review not found" 
      });
    }

    // Autorisation de mise à jour uniquement si l'utilisateur est l'auteur ou un administrateur
    if (req.user && req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ 
        status: 403,
        message: "Not authorized to update this review" 
      });
    }

    // Mise à jour de l'avis
    await Review.update(req.params.id, req.body);
    
    // Récupération de l'avis mis à jour
    const updatedReview = await Review.getById(req.params.id);
    
    // Réponse avec l'avis mis à jour
    res.status(200).json({
      status: 200,
      message: "Review successfully updated",
      data: updatedReview
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(400).json({ 
      status: 400,
      message: error.message 
    });
  }
};

/**
 * Supprime un avis
 * @route DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    // Vérification si l'avis existe
    const review = await Review.getById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        status: 404,
        message: "Review not found" 
      });
    }

    // Autorisation de suppression uniquement si l'utilisateur est l'auteur ou un administrateur
    if (req.user && req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ 
        status: 403,
        message: "Not authorized to delete this review" 
      });
    }

    // Suppression de l'avis
    await Review.delete(req.params.id);
    
    // Réponse de succès
    res.status(204).json({ 
      status: 204,
      message: "Review deleted successfully" 
    });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ 
      status: 500,
      message: error.message 
    });
  }
};
