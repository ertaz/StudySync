const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { registerRules, loginRules, validate } = require('../middlewares/validationMiddleware');

// Public routes
router.post('/register', registerRules, validate, controller.register);
router.post('/login',    loginRules,    validate, controller.login);
router.post('/refresh',                           controller.refresh);
router.post('/logout',                            controller.logout);

// Protected route — requires valid access token
router.get('/me', authenticate, controller.me);

module.exports = router;