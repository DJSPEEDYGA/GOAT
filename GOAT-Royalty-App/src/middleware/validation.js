const { body, param, query, validationResult } = require('express-validator');
const { validationError } = require('./errorHandler');

// Handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(validationError(errors));
  }
  next();
};

// User validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'artist', 'viewer'])
    .withMessage('Invalid role specified'),
  
  body('profile.firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('profile.lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'artist', 'viewer'])
    .withMessage('Invalid role specified'),
  
  handleValidationErrors
];

// Artist validation
const validateArtistCreate = [
  body('name')
    .notEmpty()
    .withMessage('Artist name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Artist name must be between 1 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Bio cannot exceed 2000 characters'),
  
  body('genre')
    .optional()
    .isArray()
    .withMessage('Genre must be an array'),
  
  body('genre.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each genre must be between 1 and 50 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  handleValidationErrors
];

const validateArtistUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Artist name must be between 1 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Bio cannot exceed 2000 characters'),
  
  handleValidationErrors
];

// Royalty validation
const validateRoyaltyCreate = [
  body('artist')
    .notEmpty()
    .withMessage('Artist is required')
    .isMongoId()
    .withMessage('Invalid artist ID'),
  
  body('workTitle')
    .notEmpty()
    .withMessage('Work title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Work title must be between 1 and 200 characters'),
  
  body('workType')
    .isIn(['song', 'album', 'video', 'book', 'software', 'other'])
    .withMessage('Invalid work type'),
  
  body('periodStart')
    .isISO8601()
    .withMessage('Period start must be a valid date'),
  
  body('periodEnd')
    .isISO8601()
    .withMessage('Period end must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.periodStart)) {
        throw new Error('Period end must be after period start');
      }
      return true;
    }),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('royaltyRate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Royalty rate must be between 0 and 100'),
  
  body('source')
    .isIn(['spotify', 'apple', 'youtube', 'amazon', 'physical', 'digital', 'other'])
    .withMessage('Invalid source'),
  
  body('salesData.unitsSold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Units sold must be a non-negative integer'),
  
  body('salesData.totalRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total revenue must be a positive number'),
  
  handleValidationErrors
];

// Payment validation
const validatePaymentCreate = [
  body('artist')
    .notEmpty()
    .withMessage('Artist is required')
    .isMongoId()
    .withMessage('Invalid artist ID'),
  
  body('royalties')
    .isArray({ min: 1 })
    .withMessage('At least one royalty is required'),
  
  body('royalties.*.royalty')
    .isMongoId()
    .withMessage('Invalid royalty ID'),
  
  body('royalties.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Royalty amount must be a positive number'),
  
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('method')
    .isIn(['bank_transfer', 'paypal', 'stripe', 'check', 'cash', 'other'])
    .withMessage('Invalid payment method'),
  
  body('processingFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Processing fees must be a positive number'),
  
  body('taxes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Taxes must be a positive number'),
  
  handleValidationErrors
];

// Contract validation
const validateContractCreate = [
  body('title')
    .notEmpty()
    .withMessage('Contract title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Contract title must be between 1 and 200 characters'),
  
  body('artists')
    .isArray({ min: 1 })
    .withMessage('At least one artist is required'),
  
  body('artists.*')
    .isMongoId()
    .withMessage('Invalid artist ID'),
  
  body('type')
    .isIn(['recording', 'publishing', 'distribution', 'licensing', 'management', 'other'])
    .withMessage('Invalid contract type'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('terms.duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 month'),
  
  handleValidationErrors
];

// Parameter validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateArtistCreate,
  validateArtistUpdate,
  validateRoyaltyCreate,
  validatePaymentCreate,
  validateContractCreate,
  validateMongoId,
  validatePagination,
  validateDateRange
};