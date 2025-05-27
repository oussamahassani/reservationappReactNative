
/**
 * Reservation Routes - Manages all API endpoints related to reservations
 * 
 * These routes handle creating, retrieving, updating, and deleting
 * reservations, as well as checking availability.
 */
const express = require("express");
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkAvailability
} = require("../controllers/reservationController");
const { reservationValidation, idValidation } = require("../middleware/validate");

// Middleware to handle JSON parsing errors
const handleJsonErrors = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid JSON in request body. Please check your request format.",
      error: err.message
    });
  }
  next(err);
};

// Apply JSON error handling middleware to this router
router.use(handleJsonErrors);

/**
 * @route   GET /api/reservations
 * @desc    Get all reservations
 * @access  Public
 * @returns Array of all reservations
 */
router.get("/", getAllReservations);

/**
 * @route   GET /api/reservations/:id
 * @desc    Get a reservation by ID
 * @access  Public
 * @param   id - Reservation ID
 * @returns Reservation data
 */
router.get("/:id", idValidation, getReservationById);

/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Public
 * @body    Reservation data (userId, eventId or placeId, numberOfTickets, status)
 * @returns Created reservation
 */
router.post("/", reservationValidation, createReservation);

/**
 * @route   PUT /api/reservations/:id
 * @desc    Update a reservation
 * @access  Public
 * @param   id - Reservation ID
 * @body    Updated data
 * @returns Updated reservation
 */
router.put("/:id", idValidation, updateReservation);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Delete a reservation
 * @access  Public
 * @param   id - Reservation ID
 * @returns Confirmation message
 */
router.delete("/:id", idValidation, deleteReservation);

/**
 * @route   GET /api/reservations/check/availability
 * @desc    Check availability
 * @access  Public
 * @query   {entityType, entityId, date, numberOfTickets}
 * @returns Availability status
 */
router.get("/check/availability", checkAvailability);

module.exports = router;