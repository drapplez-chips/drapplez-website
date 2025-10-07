// server.js
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
// Render provides the PORT environment variable
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT;
const PAYU_BASE_URL = "https://test.payu.in/_payment"; // Use test URL for now

app.post('/api/payu-data', (req, res) => {
    const { amount, productName, firstName, email } = req.body;
    const txnid = `DRAP${crypto.randomBytes(6).toString('hex')}`;

    // Render provides the hostname, so this works automatically
    const liveUrl = `https://${req.get('host')}`; 

    const hashData = {
        key: PAYU_KEY, txnid, amount, productinfo: productName, firstname: firstName, email,
        surl: `${liveUrl}/payment-success`,
        furl: `${liveUrl}/payment-failure`,
        udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', udf9: '', udf10: ''
    };

    const hashString = `${hashData.key}|${hashData.txnid}|${hashData.amount}|${hashData.productinfo}|${hashData.firstname}|${hashData.email}|${hashData.udf1}|${hashData.udf2}|${hashData.udf3}|${hashData.udf4}|${hashData.udf5}|${hashData.udf6}|${hashData.udf7}|${hashData.udf8}|${hashData.udf9}|${hashData.udf10}|${PAYU_SALT}`;

    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    const paymentPayload = { ...hashData, hash, service_provider: 'payu_paisa' };

    res.json({ ...paymentPayload, payu_url: PAYU_BASE_URL });
});

app.post('/payment-success', (req, res) => res.send('<h1>Payment Successful!</h1>'));
app.post('/payment-failure', (req, res) => res.send('<h1>Payment Failed.</h1>'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
