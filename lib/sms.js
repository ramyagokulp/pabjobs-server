const config = require("./config");
const axios = require("axios")

const sentOTP = (phone, otp) => {
    console.log('11111111111',phone,otp)
    axios.get(`https://2factor.in/API/V1/${config.smsAPIKey}/SMS/${phone}/${otp}/Login+OTP2`)
        .then((response) => {
            console.log(response)
        }).catch((err) => {
            console.log(err)
        })
};

const sentPassword = (phone, password) => {
    // axios.get(`https://2factor.in/API/V1/${config.smsAPIKey}/SMS/${phone}/${password}`)
    //     .then((response) => {
    //         // console.log(response)
    //     })
   
    axios.post(` https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${config.smsAPIKey}&to=${phone}&from=PABSPL&templatename=forgotpassword&var1=${password}`
        // `https://2factor.in/API/V1/${config.smsAPIKey}/ADDON_SERVICES/SEND/TSMS`, {
        // From: "PABSPL",
        // To: phone,
        // TemplateName: 'Forgot password',
        // VAR2: password
    // }
    ).then((res) => {
        console.log('SMS send', res.data);
    }).catch((err) => {
        console.log('Error ',err);
    })
};


const sentVerificationOTP = (phone) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://2factor.in/API/V1/${config.smsAPIKey}/SMS/${phone}/AUTOGEN/Sign+UP+OTP+`)
        .then((response) => {
            // console.log(response)
            resolve(response.data.Details)
        }).catch( (err) => {
            reject(false)
        })
    })
    
}

const verifyContact = (session_id, otp) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://2factor.in/API/V1/${config.smsAPIKey}/SMS/VERIFY/${session_id}/${otp}`)
        .then((response) => {
            // console.log(response)
            resolve(true)
        }).catch( (err) => {
            console.log('err',err.response.data.Details);
            reject(err.response.data.Details)
        })
    });
    
}


module.exports = {sentOTP, sentPassword, sentVerificationOTP, verifyContact};
