
const { body, param } = require("express-validator");

exports.sessionValidation = [
  body("userId1")
    .isInt()
    .withMessage("User ID 1 must be an integer"),
  body("userId2")
    .isInt()
    .withMessage("User ID 2 must be an integer")
    .custom((value, { req }) => {
      if (value === req.body.userId1) {
        throw new Error("Cannot create a session with the same user");
      }
      return true;
    }),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

exports.sessionUpdateValidation = [
  param("id")
    .isInt()
    .withMessage("Invalid session ID format"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("userId1")
    .optional()
    .isInt()
    .withMessage("User ID 1 must be an integer"),
  body("userId2")
    .optional()
    .isInt()
    .withMessage("User ID 2 must be an integer"),
];

exports.sessionIdValidation = [
  param("id")
    .isInt()
    .withMessage("Invalid session ID format"),
];
