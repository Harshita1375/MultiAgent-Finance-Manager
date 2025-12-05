const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {setWalletLimit, spendFromWallet, rolloverWallet } = require('../controllers/walletController');

router.post('/setup', auth, setWalletLimit);
router.post('/spend', auth, spendFromWallet);
router.post('/rollover', auth, rolloverWallet);

module.exports = router;