
/**
 * Message Routes - Handles all message-related API endpoints
 * 
 * These routes handle sending, receiving, and managing messages within the application.
 */
const express = require("express");
const router = express.Router();
const {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessagesBySession
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const { idValidation } = require("../middleware/validate");

/**
 * Authentication Middleware
 * All message routes require authentication
 */
router.use(protect);

/**
 * @route   GET /api/messages
 * @desc    Get all messages for the authenticated user
 * @access  Private - Requires authentication
 * @returns Array of messages
 */
router.get("/", getAllMessages);

/**
 * @route   GET /api/messages/session/:sessionId
 * @desc    Get all messages for a specific session
 * @access  Private - Requires authentication and session participation
 * @param   sessionId - Session ID
 * @returns Array of messages for the session
 */
router.get("/session/:sessionId", getMessagesBySession);

/**
 * @route   GET /api/messages/:id
 * @desc    Get a specific message by ID
 * @access  Private - Requires authentication
 * @param   id - Message ID
 * @returns Message data
 */
router.get("/:id", idValidation, getMessageById);

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private - Requires authentication
 * @body    {sessionId, content}
 * @returns Created message data
 */
router.post("/", createMessage);

/**
 * @route   PUT /api/messages/:id
 * @desc    Update a message (typically to mark as read)
 * @access  Private - Requires authentication
 * @param   id - Message ID
 * @body    {isRead} - Boolean indicating read status
 * @returns Updated message data
 */
router.put("/:id", idValidation, updateMessage);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete a message
 * @access  Private - Requires authentication
 * @param   id - Message ID
 * @returns Success message
 */
router.delete("/:id", idValidation, deleteMessage);

module.exports = router;
