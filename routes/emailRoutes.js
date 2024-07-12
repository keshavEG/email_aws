    const express = require('express');
    const { sendEmailsMi , sendEmailsEg, checkFreeDomain, validateEmail } = require('../controllers/emailController');

    const router = express.Router();

    router.post('/send-email-mi', sendEmailsMi);
    router.post('/send-email-eg', sendEmailsEg);
    router.post('/check', validateEmail);

    router.post("/validate" , validateEmail);


    module.exports = router;
