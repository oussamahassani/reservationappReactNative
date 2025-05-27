/**
 * Promotion Routes - Handles all promotion-related API endpoints
 *
 * These routes handle the creation, retrieval, updating, and deletion
 * of promotions, including filtering for active promotions.
 */
const express = require("express");
const router = express.Router();
const {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
} = require("../controllers/promotionController");
const { protect, admin, provider } = require("../middleware/auth");
const { promotionValidation, idValidation } = require("../middleware/validate");

/**
 * @route   GET /api/promotions/place/:placeId/active
 * @desc    Get active promotions for a specific place
 * @access  Public
 * @param   placeId - Place ID
 * @returns Array of active promotions for the place
 */
router.get("/place/:placeId/active", getActivePromotions);

// Protected Routes

/**
 * @route   GET /api/promotions
 * @desc    Get all promotions (filtered by user role)
 * @access  Private - Requires authentication
 * @query   Various filter parameters
 * @returns Array of promotions according to user permissions
 */
router.get("/", getAllPromotions);

/**
 * @route   GET /api/promotions/:id
 * @desc    Get promotion by ID
 * @access  Private - Requires authentication and access rights
 * @param   id - Promotion ID
 * @returns Promotion data
 */
router.get("/:id", idValidation, getPromotionById);

/**
 * @route   POST /api/promotions
 * @desc    Create a new promotion
 * @access  Private - Requires authentication (admin or provider)
 * @body    Promotion data
 * @returns Created promotion data
 */
router.post("/", promotionValidation, createPromotion);

/**
 * @route   PUT /api/promotions/:id
 * @desc    Update a promotion
 * @access  Private - Requires authentication and ownership
 * @param   id - Promotion ID
 * @body    Updated promotion data
 * @returns Updated promotion data
 */
router.put("/:id", idValidation, promotionValidation, updatePromotion);

/**
 * @route   DELETE /api/promotions/:id
 * @desc    Delete a promotion
 * @access  Private - Requires authentication and ownership
 * @param   id - Promotion ID
 * @returns Success message
 */
router.delete("/:id", idValidation, deletePromotion);

module.exports = router;
