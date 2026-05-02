const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(422).json({ errors: messages });
  }
  next();
};

const createProfessorRules = [
  body('first_name')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters.'),

  body('last_name')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters.'),

  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('department')
    .trim().notEmpty().withMessage('Department is required.'),

  body('title')
    .optional({ checkFalsy: true })
    .trim(),

  body('years_of_experience')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 60 }).withMessage('Years of experience must be a number between 0 and 60.'),

  body('phone_number')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{9}$/).withMessage('Phone number must be exactly 9 digits.'),
];

module.exports = { validate, createProfessorRules };