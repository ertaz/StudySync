const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return all errors as a simple array of messages
    const messages = errors.array().map(e => e.msg);
    return res.status(422).json({ errors: messages });
  }
  next();
};

// ── Register validation rules ─────────────────────────────────
const registerRules = [
  // Users table
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters.'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  // StudentProfile table
  body('student_number')
    .trim()
    .notEmpty().withMessage('Student number is required.')
    .isLength({ min: 8, max: 8 }).withMessage('Student number must be exactly 8 characters.')
    .isNumeric().withMessage('Student number must contain only numbers.'),

  body('major')
    .trim()
    .notEmpty().withMessage('Major / field of study is required.')
    .isLength({ min: 2 }).withMessage('Major must be at least 2 characters.'),

  body('enrollment_year')
    .notEmpty().withMessage('Enrollment year is required.')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage(`Enrollment year must be between 2000 and ${new Date().getFullYear() + 1}.`),

  body('date_of_birth')
    .optional({ checkFalsy: true })
    .isDate().withMessage('Date of birth must be a valid date.'),

  body('phone_number')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{9}$/).withMessage('Phone number must be exactly 9 digits and contain only numbers.'),
];

// ── Login validation rules ────────────────────────────────────
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

module.exports = { validate, registerRules, loginRules };