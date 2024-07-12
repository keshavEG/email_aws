const { sendEmailMi, sendThankYouEmailMi, sendEmailEg, sendThankYouEmailEg } = require('../models/emailModel');
const sql = require('../config/dbConfig');
const axios = require('axios');

const validateEmail = async (email) => {
    const apiKey = process.env.EMAIL_API_KEY;
    const apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=8d21ba72b2db4e2e854c31b8cba84614&email=${email}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error validating email:', error.message);
        throw error;
    }
};

const checkFreeDomain = async (email) => {
    // Check if email is a valid string
    if (typeof email !== 'string') {
        throw new Error('Invalid email format');
    }

    // Split the email to get the domain part
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
        throw new Error('Invalid email format');
    }
    const emailDomain = emailParts[1];

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('emailDomain', sql.VarChar, emailDomain)
            .query('SELECT * FROM Market_Inside_new.dbo.free_email_domain WHERE email = @emailDomain');

        return result.recordset.length > 0;
    } catch (error) {
        console.error('Error checking free email domain:', error.message);
        throw error;
    }
};

const sendEmailsMi = async (req, res) => {
    const { firstName, lastName, countryCode, contactNumber, workEmail, message, url } = req.body;

    if (!firstName || !lastName || !countryCode || !contactNumber || !workEmail || !message || !url) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        const validationResponse = await validateEmail(workEmail);
        const isFreeDomain = await checkFreeDomain(workEmail);

        if (isFreeDomain) {
            return res.status(401).send({ message: 'Please provide a valid work email.(Not Found in DB)' });
        }

        if (!validationResponse.is_valid_format.value ||
            validationResponse.is_free_email.value ||
            validationResponse.is_disposable_email.value) {
            return res.status(402).send({ message: 'Please provide a valid work email.(Not Valid by Api)' });
        }

        const response = await sendEmailMi(firstName, lastName, countryCode, contactNumber, workEmail, message, url);
        await sendThankYouEmailMi(firstName, lastName, workEmail);
        res.status(200).send({ message: 'Emails have been sent successfully', response });
    } catch (error) {
        res.status(500).send({ message: 'Error sending email', error: error.message });
    }
};

const sendEmailsEg = async (req, res) => {
    const { firstName, lastName, countryCode, contactNumber, workEmail, message, url } = req.body;

    if (!firstName || !lastName || !countryCode || !contactNumber || !workEmail || !message || !url) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        const validationResponse = await validateEmail(workEmail);
        const isFreeDomain = await checkFreeDomain(workEmail);

        if (isFreeDomain) {
            return res.status(401).send({ message: 'Please provide a valid work email.(Not Found in DB)' });
        }

        if (!validationResponse.is_valid_format.value ||
            validationResponse.is_free_email.value ||
            validationResponse.is_disposable_email.value) {
            return res.status(402).send({ message: 'Please provide a valid work email.(Not Valid by Api)' });
        }

        const response = await sendEmailEg(firstName, lastName, countryCode, contactNumber, workEmail, message, url);
        await sendThankYouEmailEg(firstName, lastName, workEmail);
        res.status(200).send({ message: 'Emails have been sent successfully', response });
    } catch (error) {
        res.status(500).send({ message: 'Error sending email', error: error.message });
    }
};

module.exports = {
    sendEmailsMi,
    sendEmailsEg,
    checkFreeDomain,
    validateEmail
};
