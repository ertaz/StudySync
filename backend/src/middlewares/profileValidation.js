// src/middlewares/profileValidation.js
const { body, validationResult } = require('express-validator');

/**
 * Validation rules for PUT /api/profile/me
 * All fields are optional — only validate what's provided.
 */
const updateProfileRules = [
  body('first_name')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be blank.')
    .isLength({ max: 100 }).withMessage('First name must be under 100 characters.'),

  body('last_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Last name cannot be blank.')
    .isLength({ max: 100 }).withMessage('Last name must be under 100 characters.'),

  body('new_password')
    .optional()
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),

  body('current_password')
    .if(body('new_password').exists({ checkFalsy: true }))
    .notEmpty().withMessage('Current password is required when setting a new password.'),

  // Student fields
  body('major')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Major must be under 150 characters.'),

  body('date_of_birth')
    .optional({ nullable: true })
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD).')
    .toDate(),

  body('phone_number')
    .optional({ nullable: true })
    .isLength({ max: 20 }).withMessage('Phone number must be under 20 characters.'),

  // Professor fields
  body('title')
    .optional({ nullable: true })
    .isLength({ max: 50 }).withMessage('Title must be under 50 characters.'),

  body('department')
    .optional({ nullable: true })
    .isLength({ max: 150 }).withMessage('Department must be under 150 characters.'),

  body('years_of_experience')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 70 }).withMessage('Years of experience must be a number between 0 and 70.')
    .toInt(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors:  errors.array(),
    });
  }
  next();
};

module.exports = { updateProfileRules, validate };