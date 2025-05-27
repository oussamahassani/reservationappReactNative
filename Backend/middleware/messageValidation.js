
const { body, param } = require("express-validator");

exports.messageValidation = [
  body("sessionId")
    .isInt()
    .withMessage("Session ID must be an integer"),
  body("senderId")
    .isInt()
    .withMessage("Sender ID must be an integer"),
  body("content")
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 1000 })
    .withMessage("Message cannot exceed 1000 characters"),
];

exports.messageUpdateValidation = [
  param("id")
    .isInt()
    .withMessage("Invalid message ID format"),
  body("read")
    .optional()
    .isBoolean()
    .withMessage("Read status must be a boolean"),
  body("content")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Message cannot exceed 1000 characters"),
];

exports.messageIdValidation = [
  param("id")
    .isInt()
    .withMessage("Invalid message ID format"),
];
