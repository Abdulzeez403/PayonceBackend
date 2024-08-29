const express = require('express');
const { handlePaystackWebhook, verifyPaystackSignature } = require('../controllers/webhookController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/paystack/webhook', verifyPaystackSignature, handlePaystackWebhook);

module.exports = router;
