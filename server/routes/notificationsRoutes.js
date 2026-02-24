const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');
const { generateNotifications, getNotifications, markRead }=require('../controllers/notificationController');

router.post('/generate',auth,generateNotifications);
router.get('/',auth,getNotifications);
router.put('/read',auth,markRead);

module.exports = router;