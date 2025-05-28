/**
 * Event Routes - Handles all event-related API endpoints
 *
 * These routes handle the creation, retrieval, updating, and deletion
 * of events, including filtering for upcoming events.
 *
 * @module routes/eventRoutes
 */
const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByPlace,
  getEventsByProvider,

  getAllEventsAccpetedByAdmin
} = require("../controllers/eventController");
const { eventValidation, idValidation } = require("../middleware/validate");

// Public Routes

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filtering
 * @access  Public
 * @query   {string} location - Filter by location (partial match)
 * @query   {string} organizer - Filter by organizer
 * @query   {string} startDate - Filter by start date (ISO format)
 * @query   {string} endDate - Filter by end date (ISO format)
 * @query   {number} provider_id - Filter by provider ID
 * @query   {number} limit - Limit number of results
 * @query   {string} sortBy - Field to sort by
 * @query   {string} sortOrder - Sort order (asc/desc)
 * @returns Array of events matching criteria
 */
router.get("/", getAllEvents);

router.get("/accepted", getAllEventsAccpetedByAdmin);
/**
 * @route   GET /api/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 * @query   {number} limit - Number of events to return (default: 10)
 * @returns Array of upcoming events
 */
router.get("/upcoming", getUpcomingEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 * @param   {number} id - Event ID
 * @returns Event data or 404 if not found
 */
router.get("/:id", idValidation, getEventById);

/**
 * @route   GET /api/events/place/:placeId
 * @desc    Get events by place ID
 * @access  Public
 * @param   {number} placeId - Place ID
 * @returns Array of events for the place
 */
router.get("/place/:placeId", getEventsByPlace);


/**
 * @route   GET /api/events/provider/:providerId
 * @desc    Get events by provider ID
 * @access  Public
 * @param   {number} providerId - Provider ID
 * @returns Array of events by the provider
 */
router.get("/provider/:providerId", getEventsByProvider);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Public
 * @body    {Object} Event data with required fields:
 *          - title: string (required)
 *          - description: string (required)
 *          - startDate: ISO date string (required)
 *          - endDate: ISO date string (required)
 *          - location: string (required)
 *          - organizer: string (optional)
 *          - ticketPrice: number (optional)
 *          - capacity: number (optional)
 *          - images: array of strings (optional)
 *          - provider_id: number (optional)
 * @returns Created event data
 */
router.post("/", eventValidation, createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Public
 * @param   {number} id - Event ID
 * @body    {Object} Updated event data (any subset of event fields)
 * @returns Updated event data
 */
router.put("/:id", idValidation, eventValidation, updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Public
 * @param   {number} id - Event ID
 * @returns Success message with 204 status code
 */
router.delete("/:id", idValidation, deleteEvent);

module.exports = router;
