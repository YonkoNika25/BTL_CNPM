const { body, validationResult } = require('express-validator');

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Ví dụ sử dụng trong authRoutes.js:
const validationMiddleware = require('../middleware/validationMiddleware');

exports.userValidationRules = () => {
    return [
        body('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('full_name').notEmpty().withMessage('Full name is required'),
        body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
    ]
}
