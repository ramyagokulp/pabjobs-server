
require('dotenv').config()

const formidable = require('formidable')
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const https = require('https')
const PaytmChecksum = require('./PaytmChecksum')


router.post('/callback', (req, res) => {
        paytmChecksum = req.body.CHECKSUMHASH;
        delete req.body.CHECKSUMHASH;
        var isVerifySignature = PaytmChecksum.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
        if (isVerifySignature) {
            var paytmParams = {};
            paytmParams["MID"] = req.body.MID;
            paytmParams["ORDERID"] = req.body.ORDERID;

            /*
            * Generate checksum by parameters we have
            * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
            */
            PaytmChecksum.generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY).then(function (checksum) {

                paytmParams["CHECKSUMHASH"] = checksum;

                var post_data = JSON.stringify(paytmParams);

                var options = {

                    /* for Staging */
                    // hostname: 'securegw-stage.paytm.in',

                    /* for Production */
                    hostname: 'securegw.paytm.in',
                    port: 443,
                    path: '/order/status',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };

                var response = "";
                var post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk;
                    });

                    post_res.on('end', function () {
                        let result = JSON.parse(response)
                        console.log(result)
                        if (result.STATUS === 'TXN_SUCCESS') {
                            res.redirect(`https://pabjobs.com/success/${result.ORDERID}`)
                        }
                        else{
                            res.redirect(`https://pabjobs.com/failed/${result.ORDERID}`)
                        }
                    });
                });

                post_req.write(post_data);
                post_req.end();
            });

        } else {
            console.log("Checksum Mismatched");
        }
})



router.post('/payment', (req, res) => {
    const { name, email, phone, amount } = req.body;
    /* import checksum generation utility */
    // const totalAmount = JSON.stringify(amount);
    var params = {};
    console.log(req.body)
    /* initialize an array */
    params['MID'] = process.env.PAYTM_MID;
    params['WEBSITE'] = process.env.PAYTM_WEBSITE;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = name;
    params['TXN_AMOUNT'] = amount;
    params['CALLBACK_URL'] = 'https://api.pabjobs.com/paytm/callback';
    params['EMAIL'] = email;
    params['MOBILE_NO'] = phone;

    /**
    * Generate checksum by parameters we have
    * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
    */
    console.log(process.env.PAYTM_MERCHANT_KEY)
    var paytmChecksum = PaytmChecksum.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);
    paytmChecksum.then(function (checksum) {
        let paytmParams = {
            ...params,
            "CHECKSUMHASH": checksum
        }
        res.json(paytmParams)
    }).catch(function (error) {
        console.log(error);
    });

})

module.exports = router