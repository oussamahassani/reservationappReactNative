
/**
 * Event Controller - Handles all event-related business logic
 * 
 * This controller provides functionality for creating, retrieving, updating, and deleting
 * events, including filtering for upcoming events by different criteria.
 * 
 * @module controllers/eventController
 */
const Event = require("../models/eventModel");
const Place = require("../models/placeModel");
const { validationResult } = require("express-validator");

/**
 * Get all events with optional filtering
 * @route GET /api/events
 * @param {Object} req.query - Optional filter criteria
 * @param {string} req.query.location - Filter by location (partial match)
 * @param {string} req.query.organizer - Filter by organizer
 * @param {string} req.query.startDate - Filter by events after this date
 * @param {string} req.query.endDate - Filter by events before this date
 * @param {number} req.query.place_id - Filter by place ID
 * @returns {Object} Response with status code and data containing events
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAll(req.query);
    res.status(200).json({
      status: 200,
      data: events,
      count: events.length,
      message: "Events retrieved successfully",
      filters: req.query
    });
  } catch (error) {
    console.error("Error retrieving events:", error);
    res.status(500).json({ 
      status: 500,
      message: error.message,
      error: "Failed to retrieve events"
    });
  }
};
exports.getAllEventsAccpetedByAdmin= async (req, res) => {
  try {
    const events = await Event.getAll({...req.query , status:"completed"});
    res.status(200).json({
      status: 200,
      data: events,
      count: events.length,
      message: "Events retrieved successfully",
      filters: req.query
    });
  } catch (error) {
    console.error("Error retrieving events:", error);
    res.status(500).json({ 
      status: 500,
      message: error.message,
      error: "Failed to retrieve events"
    });
  }
};
/**
 * Get event by ID
 * @route GET /api/events/:id
 * @param {number} req.params.id - Event ID
 * @returns {Object} Response with status code and data containing event
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        status: 404,
        message: "Event not found" 
      });
    }
    res.status(200).json({
      status: 200,
      data: event,
      message: "Event retrieved successfully"
    });
  } catch (error) {
    console.error("Error retrieving event by ID:", error);
    res.status(500).json({ 
      status: 500,
      message: error.message,
      error: "Failed to retrieve event"
    });
  }
};

/**
 * Create a new event
 * @route POST /api/events
 * @param {Object} req.body - Event data
 * @param {string} req.body.title - Title of the event (required)
 * @param {string} req.body.description - Description of the event (required)
 * @param {string} req.body.startDate - Start date of the event (ISO format, required)
 * @param {string} req.body.endDate - End date of the event (ISO format, required)
 * @param {string} req.body.location - Location of the event (required)
 * @param {string} req.body.organizer - Organizer of the event (optional)
 * @param {number} req.body.ticketPrice - Ticket price (optional)
 * @param {number} req.body.capacity - Maximum capacity (optional)
 * @param {Array} req.body.images - Array of image URLs or filenames (optional)
 * @param {number} req.body.place_id - ID of the associated place (optional)
 * @returns {Object} Response with status code, message and created event data
 */
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 400,
      errors: errors.array(),
      message: "Validation failed"
    });
  }

  try {
    // Check if the place exists when place_id is provided
    if (req.body.place_id) {
      const place = await Place.getById(req.body.place_id);
      
      if (!place) {
        return res.status(404).json({
          status: 404,
          message: "Place not found, cannot create event for non-existent place"
        });
      }

      // Auto-assign provider_id from place if not explicitly provided
      if (!req.body.provider_id && place.provider_id) {
        req.body.provider_id = place.provider_id;
      }
    }

    const eventId = await Event.create(req.body);
    const event = await Event.getById(eventId);
    
    res.status(201).json({
      status: 201,
      message: "Event created successfully",
      data: event
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({ 
      status: 400,
      message: error.message,
      error: "Failed to create event"
    });
  }
};

/**
 * Update an existing event
 * @route PUT /api/events/:id
 * @param {number} req.params.id - Event ID to update
 * @param {Object} req.body - Updated event data (fields to update)
 * @returns {Object} Response with status code, message and updated event data
 */
exports.updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
        console.log(errors)
    return res.status(400).json({ 
      status: 400,
      errors: errors.array(),
      message: "Validation failed"
    });
  }

  try {
    // Check if the event exists
    const event = await Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        status: 404,
        message: "Event not found" 
      });
    }

    // Check if place_id is being updated and if it exists
    if (req.body.place_id) {
      const place = await Place.getById(req.body.place_id);
      if (!place) {
        return res.status(404).json({
          status: 404,
          message: "Place not found, cannot update event with non-existent place"
        });
      }
    }

    await Event.update(req.params.id, req.body);
    
    const updatedEvent = await Event.getById(req.params.id);
    res.status(200).json({
      status: 200,
      message: "Event updated successfully",
      data: updatedEvent,
      updated_fields: Object.keys(req.body)
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(400).json({ 
      status: 400,
      message: error.message,
      error: "Failed to update event"
    });
  }
};

/**
 * Delete an event
 * @route DELETE /api/events/:id
 * @param {number} req.params.id - Event ID to delete
 * @returns {Object} Response with status code and success message
 */
exports.deleteEvent = async (req, res) => {
  try {
    // Check if the event exists
    const event = await Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        status: 404,
        message: "Event not found" 
      });
    }

    await Event.delete(req.params.id);
    res.status(204).json({ 
      status: 204,
      message: "Event deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ 
      status: 500,
      message: error.message,
      error: "Failed to delete event"
    });
  }
};

/**
 * Get upcoming events
 * @route GET /api/events/upcoming
 * @param {number} req.query.limit - Maximum number of events to return (default: 10)
 * @returns {Object} Response with status code and data containing upcoming events
 */
exports.getUpcomingEvents = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const events = await Event.getUpcomingEvents(limit);
    res.status(200).json({
      status: 200,
      data: events,
      count: events.length,
      message: "Upcoming events retrieved successfully"
    });
  } catch (error) {
    console.error("Error retrieving upcoming events:", error);
    res.status(500).json({ 
      status: 500,
      message: error.message,
      error: "Failed to retrieve upcoming events"
    });
  }
};

/**
 * Get events by place ID
 * @route GET /api/events/place/:placeId
 * @param {number} req.params.placeId - Place ID to filter events by
 * @returns {Object} Response with status code and data containing events for the place
 */
exports.getEventsByPlace = async (req, res) => {
  try {
    const placeId = req.params.placeId;
    
    // First check if the place exists
    const place = await Place.getById(placeId);
    if (!place) {
      return res.status(404).json({
        status: 404,
        message: "Place not found"
      });
    }
    
    const events = await Event.getByPlaceId(placeId);
    res.status(200).json({
      status: 200,
      data: events,
      count: events.length,
      message: `Events for place ID ${placeId} retrieved successfully`,
      place_id: placeId,
      place: place
    });
  } catch (error) {
    console.error("Error retrieving events by place:", error);
    res.status(500).json({
      status: 500,
      message: error.message,
      error: "Failed to retrieve events for the specified place"
    });
  }
};

/**
 * Get events by provider ID
 * @route GET /api/events/provider/:providerId
 * @param {number} req.params.providerId - Provider ID to filter events by
 * @returns {Object} Response with status code and data containing events by the provider
 */
exports.getEventsByProvider = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const events = await Event.getByProviderId(providerId);
    res.status(200).json({
      status: 200,
      data: events,
      count: events.length,
      message: `Events by provider ID ${providerId} retrieved successfully`,
      provider_id: providerId
    });
  } catch (error) {
    console.error("Error retrieving events by provider:", error);
    res.status(500).json({
      status: 500,
      message: error.message,
      error: "Failed to retrieve events for the specified provider"
    });
  }
};
