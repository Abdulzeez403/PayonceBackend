const express = require('express');
const { initializePayStackPayment, verifyPayStackPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/initialize', initializePayStackPayment);
router.post('/verify', verifyPayStackPayment);

module.exports = router;
