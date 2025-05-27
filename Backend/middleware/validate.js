const { body, validationResult, param, query } = require("express-validator");

exports.registerValidation = [
  body("firstName").notEmpty().withMessage("firstName is required"),
  body("lastName").notEmpty().withMessage("lastName is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.placeValidation = [
  body("name")
    .notEmpty()
    .withMessage("Place name is required")
    .isLength({ max: 255 })
    .withMessage("Name too long"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isLength({ max: 50 })
    .withMessage("Type too long"),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description too long"),
  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be an object"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("openingHours")
    .optional()
    .isObject()
    .withMessage("Opening hours must be an object"),
  body("entranceFee")
    .optional()
    .isObject()
    .withMessage("Entrance fee must be an object"),
];

exports.idValidation = [param("id").isInt().withMessage("Invalid ID format")];

exports.reviewValidation = [
  body("placeId").isInt().withMessage("Place ID is required"),
  body("rating")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),
  body("comment")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Comment too long"),
];

exports.reservationValidation = [
  body("userId").notEmpty().isInt().withMessage("Valid user ID is required"),
  body("eventId")
    .optional()
    .isInt()
    .withMessage("Valid event ID is required")
    .custom((value, { req }) => {
      if (!value && !req.body.placeId) {
        throw new Error("Either eventId or placeId is required");
      }
      return true;
    }),
  body("placeId")
    .optional()
    .isInt()
    .withMessage("Valid place ID is required"),
  body("numberOfTickets")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Number of tickets must be at least 1"),
  body("visitDate")
    .optional()
    .isISO8601()
    .withMessage("Visit date must be a valid date in ISO 8601 format"),
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Invalid status value"),
];

exports.eventValidation = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 255 }).withMessage("Title must be between 3 and 255 characters"),
  
  body("description")
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
  
  body("startDate")
    .notEmpty().withMessage("Start date is required")
    .isISO8601().withMessage("Start date must be a valid ISO 8601 date format (YYYY-MM-DDTHH:mm:ss)")
    .custom(value => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid start date");
      }
      return true;
    }),
  
  body("endDate")
    .notEmpty().withMessage("End date is required")
    .isISO8601().withMessage("End date must be a valid ISO 8601 date format (YYYY-MM-DDTHH:mm:ss)")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date");
      }
      
      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  
  body("location")
    .notEmpty().withMessage("Location is required")
    .isLength({ min: 2, max: 255 }).withMessage("Location must be between 2 and 255 characters"),
  
  body("organizer")
    .optional()
    .isLength({ min: 2, max: 255 }).withMessage("Organizer must be between 2 and 255 characters"),
  
  body("ticketPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("Ticket price must be a positive number or zero"),
  
  body("capacity")
    .optional()
    .isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
  
  body("images")
    .optional()
    .custom(value => {
      if (!Array.isArray(value) && typeof value !== 'string') {
        throw new Error("Images must be an array or a JSON string array");
      }
      if (Array.isArray(value)) {
        for (const img of value) {
          if (typeof img !== 'string') {
            throw new Error("Each image must be a string (URL or filename)");
          }
        }
      }
      return true;
    }),
  
  body("provider_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Provider ID must be a positive integer")
];

exports.promotionValidation = [
  body("place_id").isInt().withMessage("Place ID is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("discount_percent")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("start_date").isDate().withMessage("Valid start date is required"),
  body("end_date")
    .isDate()
    .withMessage("Valid end date is required")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
];

exports.userUpdateValidation = [
  body("firstName")
    .optional()
    .notEmpty().withMessage("firstName cannot be empty")
    .isString().withMessage("firstName must be a string")
    .trim(),
  
  body("lastName")
    .optional()
    .notEmpty().withMessage("lastName cannot be empty")
    .isString().withMessage("lastName must be a string")
    .trim(),
  
  body("email")
    .optional()
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),
  
  body("password")
    .optional()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  
  body("role")
    .optional()
    .isIn(["admin", "user", "provider"]).withMessage("Invalid role"),
  
  body("phone")
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage("Invalid phone number format"),
  
  body("status")
    .optional()
    .isIn(["active", "blocked", "inactive"]).withMessage("Invalid status")
];

exports.searchValidation = [
  query("category")
    .optional()
    .isIn(["museums", "hotels", "restaurants", "historical", "attractions"])
    .withMessage("Invalid category"),
  query("near")
    .optional()
    .matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?(,\d+(\.\d+)?)?$/)
    .withMessage("Near parameter must be in format lat,lng[,distance]"),
  query("sort")
    .optional()
    .isIn(["rating", "name", "newest", "distance"])
    .withMessage("Invalid sort parameter"),
];

exports.passwordResetValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("resetCode").notEmpty().withMessage("Reset code is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
];
