
const { body, param } = require("express-validator");

exports.messageValidation = [
  body("id_destinataire")
    .isInt()
    .withMessage("Destinataire ID must be an integer"),
  body("texte")
    .notEmpty()
    .withMessage("Message text is required")
    .isLength({ max: 1000 })
    .withMessage("Message cannot exceed 1000 characters"),
];

exports.messageIdValidation = [
  param("id").isInt().withMessage("Invalid message ID format"),
];

exports.conversationValidation = [
  param("userId").isInt().withMessage("Invalid user ID format"),
];
