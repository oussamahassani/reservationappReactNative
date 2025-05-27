
/**
 * Routes des Lieux - Gère tous les points d'accès API liés aux lieux
 * 
 * Ces routes gèrent la création, la récupération, la mise à jour et la suppression
 * des lieux.
 */
const express = require("express");
const router = express.Router();
const {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  searchPlaces,
  getPlacesByRegion,
  getPopularPlaces,
  getPlacesByProvider,
  getProviderPlaces
} = require("../controllers/placeController");
const { placeValidation, idValidation } = require("../middleware/validate");

/**
 * @route   GET /api/places
 * @desc    Obtenir tous les lieux
 * @access  Public
 * @returns Tableau de tous les lieux
 */
router.get("/", getAllPlaces);

/**
 * @route   GET /api/places/search
 * @desc    Rechercher des lieux avec différents filtres
 * @access  Public
 * @query   Différents paramètres de recherche
 * @returns Tableau des lieux correspondants
 */
router.get("/search", searchPlaces);

/**
 * @route   GET /api/places/region/:region
 * @desc    Obtenir les lieux par région
 * @access  Public
 * @param   region - Nom de la région
 * @returns Tableau des lieux dans la région spécifiée
 */
router.get("/region/:region", getPlacesByRegion);

/**
 * @route   GET /api/places/popular
 * @desc    Obtenir les lieux populaires
 * @access  Public
 * @query   {limit} - Nombre de lieux à retourner
 * @returns Tableau des lieux populaires
 */
router.get("/popular", getPopularPlaces);

/**
 * @route   GET /api/places/provider/:providerId
 * @desc    Obtenir les lieux par prestataire
 * @access  Public (était auparavant protégé)
 * @param   providerId - ID utilisateur du prestataire
 * @returns Tableau des lieux appartenant au prestataire
 */
router.get("/provider/:providerId", getPlacesByProvider);

/**
 * @route   GET /api/places/provider/:providerId/all
 * @desc    Obtenir tous les lieux d'un prestataire (y compris inactifs)
 * @access  Public
 * @param   providerId - ID utilisateur du prestataire
 * @returns Tableau de tous les lieux appartenant au prestataire
 */
router.get("/provider/:providerId/all", getProviderPlaces);

/**
 * @route   GET /api/places/:id
 * @desc    Obtenir un lieu par ID
 * @access  Public
 * @param   id - ID du lieu
 * @returns Données détaillées du lieu
 */
router.get("/:id", idValidation, getPlaceById);

/**
 * @route   POST /api/places
 * @desc    Créer un nouveau lieu
 * @access  Public (était auparavant protégé pour admin ou prestataire)
 * @body    Données du lieu
 * @returns Données du lieu créé
 */
router.post("/", placeValidation, createPlace);

/**
 * @route   PUT /api/places/:id
 * @desc    Mettre à jour un lieu
 * @access  Public (était auparavant protégé pour admin ou prestataire propriétaire)
 * @param   id - ID du lieu
 * @body    Données mises à jour du lieu
 * @returns Données du lieu mis à jour
 */
router.put("/:id", idValidation, placeValidation, updatePlace);

/**
 * @route   DELETE /api/places/:id
 * @desc    Supprimer un lieu
 * @access  Public (était auparavant protégé pour admin ou prestataire propriétaire)
 * @param   id - ID du lieu
 * @returns Message de succès
 */
router.delete("/:id", idValidation, deletePlace);

module.exports = router;
