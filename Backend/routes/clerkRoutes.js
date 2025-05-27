
/**
 * Clerk Routes - Handles Clerk authentication integration
 * 
 * These routes handle the synchronization between Clerk authentication
 * service and the application's user management system.
 */
const express = require('express');
const router = express.Router();
const clerkController = require('../controllers/clerkController');

/**
 * @route   POST /api/clerk/sync
 * @desc    Synchronize Clerk user with the application's user database
 * @access  Public
 * @body    {email, nom, prenom, phone, profileImage, oauth_id, oauth_provider}
 * @returns User data
 */
router.post('/sync', clerkController.syncClerkUser);

/**
 * @route   POST /api/clerk/signout
 * @desc    Handle Clerk sign out events
 * @access  Public
 * @returns Success message
 */
router.post('/signout', clerkController.handleClerkSignout);

module.exports = router;
