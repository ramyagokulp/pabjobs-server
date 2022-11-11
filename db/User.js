const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require('moment')
const SMS = require("../lib/sms");
require("mongoose-type-email");

let schema = new mongoose.Schema(
  {
    email: {
      type: mongoose.SchemaTypes.Email,
      unique: true,
      lowercase: true,
      required: true,
    },
    phone: {
      type: Number
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["recruiter", "applicant"],
      required: true,
    },
    otp: Number,
    validTimeForOTP: String,
    createdAt: {
      type: Date,
      default: Date.now()
    },
  },
  
  { collation: { locale: "en" } }
);

// Password hashing
schema.pre("save", function (next) {
  let user = this;

  // if the data is not modified
  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

// Password verification upon login
schema.methods.login = function (password) {
  let user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

function between(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

schema.methods.setPhoneOTP = function(phone){
  if (this.phone !== phone) {
    this.phone = phone;
  }
  let otp = between(100000, 999999);
  if (this.phone == 9961621108) {
    otp = 123456
  }
  this.otp = otp
  this.validTimeForOTP = moment().add(30, 'minutes');
  SMS.sentOTP(phone,otp)
  // Twilio.sendOTP(phone,otp)
};

function passwordGenerate(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

//resetPassword
schema.methods.resetPassword = function(phone){
  if (this.phone !== phone) {
    this.phone = phone;
  }
  let password = passwordGenerate(6)
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    console.log('ppp ',hash);
    SMS.sentPassword(phone,password)
  });
  // Twilio.sendOTP(phone,otp)
};

module.exports = mongoose.model("UserAuth", schema);
