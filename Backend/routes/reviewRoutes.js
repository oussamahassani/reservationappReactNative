/**
 * Routes des avis - Gère tous les points d'entrée API liés aux avis
 *
 * Ces routes gèrent la création, la récupération, la mise à jour et la suppression
 * des avis sur les lieux touristiques.
 */
const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  getReviewsByPlace,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");
const { reviewValidation, idValidation } = require("../middleware/validate");

// Routes publiques

/**
 * @route   GET /api/reviews
 * @desc    Récupère tous les avis avec filtrage optionnel
 * @access  Public
 * @query   placeId, userId - paramètres de filtrage
 * @returns Tableau d'avis
 */
router.get("/", getAllReviews);

/**
 * @route   GET /api/reviews/place/:placeId
 * @desc    Récupère tous les avis pour un lieu spécifique
 * @access  Public
 * @param   placeId - Identifiant du lieu
 * @returns Tableau d'avis avec statistiques de notation
 */
router.get("/place/:placeId", getReviewsByPlace);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Récupère tous les avis d'un utilisateur spécifique
 * @access  Public
 * @param   userId - Identifiant de l'utilisateur
 * @returns Tableau d'avis
 */
router.get("/user/:userId", getReviewsByUser);

/**
 * @route   GET /api/reviews/:id
 * @desc    Récupère un avis par son identifiant
 * @access  Public
 * @param   id - Identifiant de l'avis
 * @returns Données de l'avis
 */
router.get("/:id", idValidation, getReviewById);

// Routes protégées

/**
 * @route   POST /api/reviews
 * @desc    Crée un nouvel avis
 * @access  Privé - Nécessite une authentification
 * @body    Données de l'avis (placeId, rating, comment)
 * @returns Données de l'avis créé
 */
router.post("/", protect, reviewValidation, createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Met à jour un avis
 * @access  Privé - Nécessite une authentification et la propriété
 * @param   id - Identifiant de l'avis
 * @body    Données mises à jour de l'avis (rating, comment)
 * @returns Données de l'avis mis à jour
 */
router.put("/:id", idValidation, reviewValidation, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Supprime un avis
 * @access  Privé - Nécessite une authentification et la propriété
 * @param   id - Identifiant de l'avis
 * @returns Message de succès
 */
router.delete("/:id", idValidation, deleteReview);

module.exports = router;
