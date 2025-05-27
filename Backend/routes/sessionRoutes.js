
/**
 * Session Routes - Handles all session-related API endpoints
 * 
 * These routes handle creating, fetching, and managing message sessions
 * between users within the application.
 */
const express = require("express");
const router = express.Router();
const {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
} = require("../controllers/sessionController");
const { protect } = require("../middleware/auth");
const { idValidation } = require("../middleware/validate");

/**
 * Authentication Middleware
 * All session routes require authentication
 */
router.use(protect);

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions for the authenticated user
 * @access  Private - Requires authentication
 * @returns Array of sessions with latest message and other user details
 */
router.get("/", getAllSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get a specific session by ID with messages
 * @access  Private - Requires authentication and session participation
 * @param   id - Session ID
 * @returns Session data with messages and user details
 */
router.get("/:id", idValidation, getSessionById);

/**
 * @route   POST /api/sessions
 * @desc    Create a new session between two users
 * @access  Private - Requires authentication
 * @body    {userId2} - ID of the user to start conversation with
 * @returns Created session data
 */
router.post("/", createSession);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update a session (typically to mark as inactive)
 * @access  Private - Requires authentication and session participation
 * @param   id - Session ID
 * @body    {isActive} - Boolean indicating session status
 * @returns Updated session data
 */
router.put("/:id", idValidation, updateSession);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete a session
 * @access  Private - Requires authentication and session participation
 * @param   id - Session ID
 * @returns Success message
 */
router.delete("/:id", idValidation, deleteSession);

module.exports = router;
