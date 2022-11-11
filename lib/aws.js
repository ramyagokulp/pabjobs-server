var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
require('dotenv').config();

var s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
    }
}

module.exports = {
    sendOTP(phone, otp) {
        var params = {
            Message: otp + " is your verfication code",
            PhoneNumber: phone,
        };
        return new aws.SNS({apiVersion: '2010–03–31'}).publish(params).promise()
            .then(message => {
                // console.log('mes ',message);
                console.log("OTP SEND SUCCESS to "+phone);
            })
            .catch(err => {
                console.log("Error "+err)
                return err;
            });
    },
    upload: multer({
        // fileFilter,
        storage: multerS3({
          s3: s3,
          bucket: 'pabsolution-bucket-1',
          acl: 'public-read',
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            console.log('req ',req);
            let fileName = 'mobile/resume/'+Date.now().toString()
            cb(null, fileName + '.' + file.originalname.split('.').pop())
          }
        })
    })
}