/**
 * User Routes - Handles all user-related API endpoints
 *
 * These routes handle user registration, authentication, profile management,
 * and administrative functions for user accounts.
 * All routes are now public with no authentication requirements for simplicity.
 */
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  sendHelpEmail,
} = require("../controllers/userController");
const { userUpdateValidation } = require("../middleware/validate");

console.log("📌 Configuration des routes utilisateur");

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user
 * @access  Public
 * @body    {email, password}
 * @returns User data
 */
router.post("/login", login);
console.log("🔹 Route POST /login configurée");

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 * @body    {name, email, password}
 * @returns User data without sensitive information
 */
router.post("/register", register);
console.log("🔹 Route POST /register configurée");

/**
 * @route   GET /api/users
 * @desc    Get all users with basic information
 * @access  Public
 * @returns Array of users
 */
router.get("/", getAllUsers);
console.log("🔹 Route GET / configurée");

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 * @returns User data
 */
router.get("/:id", getUserById);
console.log("🔹 Route GET /:id configurée");

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 * @body    {name, email, password, role}
 * @returns Created user data
 */
router.post("/", createUser);
console.log("🔹 Route POST / configurée");

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Public
 * @param   id - User ID
 * @body    {firstName, lastName, email, password, role, phone, status}
 * @returns Updated user data
 */
router.put("/:id", userUpdateValidation, updateUser);
console.log("🔹 Route PUT /:id configurée");

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 * @param   id - User ID
 * @returns Success message
 */
router.delete("/:id", deleteUser);
console.log("🔹 Route DELETE /:id configurée");

router.post("/help", sendHelpEmail);

console.log("✅ Configuration des routes utilisateur terminée");

module.exports = router;
