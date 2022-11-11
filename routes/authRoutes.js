const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = require("../lib/authKeys");
const SMS = require("../lib/sms");
const User = require("../db/User");
const JobApplicant = require("../db/JobApplicant");
const Recruiter = require("../db/Recruiter");
// const Profile = require("../db/ProfileDetails")
const bcrypt = require('bcrypt')
const moment = require('moment');
const { sendMail } = require("../utils/mail");
const googleAuth = require("../utils/googleAuth");
const jwtAuth = require("../lib/jwtAuth");
// const { welcomeMail } = require("../lib/mailTemplateGenerator");
let randomToken = require('random-token').create('aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuvwxzy0123456789');

const router = express.Router();

function passwordGenerate(length) {
  var result = '';
  var characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

function between(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

router.get("/mail", async (req, res) => {
  await sendMail("abdullaanasanu@gmail.com",'Welcome to PAB Jobs', welcomeMail("Abdulla Anas"))
  res.json({ msg: "Ttt" })
})

// Signup Routing
router.post("/signup", (req, res) => {
  let token = randomToken(10);
  console.log(token,'token')
  const data = req.body;
  let user = new User({
    email: data.email,
    originalPassword: token,
    password: token,
    type: data.type,
    phone: data.contactNumber,
  });

  user
    .save()
    .then(() => {
      const userDetails =
        user.type == "recruiter"
          ? new Recruiter({
            userId: user._id,
            companyname: data.name,
            hrname: data.hrname,
            description: data.description,
            contactNumber: data.contactNumber,
            email: data.email,
         
          })
          : new JobApplicant({
            userId: user._id,
            name: data.name,
            email: data.email,
            rating: data.rating,
            contactNumber: data.contactNumber,
            lastname: data.lastname,
            qualification: data.qualification,
            yop: data.yop,
            state: data.state,
            collegename:data.collegename,
            percentage:data.percentage,
            // location: data.location,
            // location: data.locality,

          });

      //   const ProfileDetails = 
      //   new Profile({
      //    userId: user._id,
      //    profilename:data.name
      //  });
      //  ProfileDetails.save()

      userDetails
        .save()
        .then(async () => {
          // Token
          const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
          // await sendMail(data.email,'Welcome to PAB Jobs', welcomeMail(data.name))
          res.json({
            token: token,
            type: user.type,
          });
        })
        .catch((err) => {
          console.log('eeee ',err);
          user
            .delete()
            .then(() => {
              res.status(400).json({ message: "User Already Exists" });
            })
            .catch((err) => {
              res.json({ message: err.message });
            });

        });
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json({ message: "User Already Exists" });
    });

});


router.post("/email/send-otp", jwtAuth, async (req, res, next) => {
 const user = req.user;
 
 let otp = between(100000, 999999);
 await JobApplicant.findOneAndUpdate({userId:user.Id},{emailOtp:otp})
 await sendMail(user.email,'Email Verification', `<h3>Hi, Your OTP Is ${otp}</h3>`)
 return res.json({message:"OTP Send"})
})

router.post("/email/verify-otp", jwtAuth, async (req, res, next) => {
  let { otp } = req.body;
  const user = req.user;
  let emailVerification = await JobApplicant.findOne({userId:user._id,emailOtp:otp})
  
  if(emailVerification) {
    emailVerification.isEmailVerified = true;
    emailVerification.save();
    return res.json({message:"Email Verified"})
  }else{
    return res.status(400).json({message:"Verification Failed"})
  }
 })
 

 router.post("/mobile/contact/send-otp", jwtAuth,async (req, res) => {
  const user = req.user;
  let otp = between(100000, 999999);
  let jobApplicant = await JobApplicant.findOne({userId:user._id})
  if(jobApplicant) {
    await JobApplicant.findOneAndUpdate({userId:user._id},{contactOtp:otp})
    await SMS.sentOTP(jobApplicant.contactNumber,otp)
    return res.json({message:"OTP Send"})
  } else {
  return res.status(400).json({message:"Authentication Failed"})
  }
  
})

router.post("/mobile/contact/verify-otp", jwtAuth,async (req, res) => {
  const user = req.user;
  let { otp } = req.body;
  let phoneVerification = await JobApplicant.findOne({userId:user._id,emailOtp:otp})
  
  if(phoneVerification) {
    phoneVerification.isPhoneVerified = true;
    phoneVerification.save();
    return res.json({message:"Phone Verified"})
  }else{
    return res.status(400).json({message:"Verification Failed"})
  }
  
})



router.post("/signup/google", async (req, res) => {
  const data = req.body;
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ message: "Invalid Token" });
  }
  let auth = await googleAuth(token)
  if (!auth) {
    
    return res.status(400).json({ message: "Invalid Token" });
  }
  let user = new User({
    email: data.email,
    password: "Perfex@2022",
    type: data.type,
    phone: Math.floor(Math.random() * 100000000)
  });

  user
    .save()
    .then(() => {
      const userDetails =
        user.type == "recruiter"
          ? new Recruiter({
            userId: user._id,
            companyname: data.name,
            contactNumber: 0,
            email: data.email,
          })
          : new JobApplicant({
            userId: user._id,
            name: data.name,
            email: data.email,
            // rating: data.rating,
            contactNumber: 0,
          });

      //   const ProfileDetails = 
      //   new Profile({
      //    userId: user._id,
      //    profilename:data.name
      //  });
      //  ProfileDetails.save()

      userDetails
        .save()
        .then(async () => {
          // Token
          const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
          // await sendMail(data.email,'Welcome to PAB Jobs', `<h3>Hi ${data.name}, Welcome to PAB</h3>`)
          res.json({
            token: token,
            type: user.type,
          });
        })
        .catch((err) => {
         console.log('eeee ',err);
          user
            .delete()
            .then(() => {
              res.status(400).json({ message: "User Already Exists" });
            })
            .catch((err) => {
              res.json({ message: err.message });
            });
            
        });
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json({ message: "User Already Exists" });
    });

});


// Login Routing
router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      // Token
      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: token,
        type: user.type,
      });
    }
  )(req, res, next);
});

router.post("/login/google", async (req, res, next) => {
  const data = req.body;
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ message: "Invalid Token" });
  }
  let auth = await googleAuth(token)
  if (!auth) {
    
    return res.status(400).json({ message: "Invalid Token" });
  }
  let user = await User.findOne({email: auth.email})
      if (!user) {
        res.status(401).json({message: "Not registered yet!"});
        return;
      }
      // Token
      const jwtToken = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: jwtToken,
        type: user.type,
      });
    
});

router.post("/mobile/send-otp", async (req, res) => {
  const { phone } = req.body;
  let user = await User.findOne({ phone });
  if (user) {
    await user.setPhoneOTP(phone);
    return user.save().then(() => {
      return res.json({ message: "OTP Send" })
    })
  } else {
    res.status(400).json({ message: "User Not Registered" });
  }
})



router.post("/mobile/verify-otp", async (req, res, next) => {
  User.findOne({ phone: req.body.phone }).then(async(user) => {
    console.log('uuu ', user);
    if (user) {
      let dif = moment(user.validTimeForOTP).diff(moment(), 'seconds')
      if (dif > 0) {
        if (user.otp == req.body.otp) {
          if(user.type === "applicant") {
            await JobApplicant.findOneAndUpdate({userId:user._id},{isPhoneVerified:true})
          }
          const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
          return res.json({
            token: token,
            type: user.type,
          });

        } else {
          return res.status(401).json({ message: 'Invalid OTP' })
        }
      } else {
        return res.status(401).json({ message: 'OTP expired, try to generate new OTP' })
      }
    }
  }).catch(next);
})

router.post("/contact-verification/send-otp", async (req, res, next) => {
  const { phone } = req.body;
  let user = await User.findOne({ phone });
  if(user){
    return res.status(400).json({ message: 'User already exist' })
  }
  if (!req.body.phone) {
    return res.status(400).json({ message: 'Phone number is required' })
  }
  SMS.sentVerificationOTP(req.body.phone).then((sessionId) => {
    return res.json({ sessionId, message: "OTP sended"})
  }).catch(() => {
    return res.status(400).json({ message: 'OTP not send' })
  })
  
})

router.post("/contact-verification/verify-otp", async (req, res) => {
  if (!req.body.sessionId) {
    return res.status(400).json({ message: 'Session ID is required' })
  }
  if (!req.body.otp) {
    return res.status(400).json({ message: 'OTP is required' })
  }
  SMS.verifyContact(req.body.sessionId, req.body.otp).then(() => {
    return res.json({ message: "OTP Verified"})
  }).catch( errMsg => {
    return res.status(401).json({ message: errMsg})
  })
  
})


router.post("/forgot-password", async (req, res) => {
  const { phone } = req.body;
  let user = await User.findOne({ phone });
  if (user) {
    let password = passwordGenerate(6)
    
      user.password = password;
      SMS.sentPassword(phone, password)
      return user.save().then(() => {
        return res.json({ message: "New password send" })
      })

  } else {
    res.status(400).json({ message: "User Not Registered" });
  }
})

// MobileLogin Routing
router.post("/mobilelogin", (req, res) => {
  const { phone } = req.body;
  console.log(phone)
  if (!phone) {
    return res.status(422).json({ error: "Please fill all the fields" })
  } else {
    User.findOne({ contactNumber: phone }).then((savedUser) => {
      if (!savedUser) {
        res.status(422).json({ error: "User not exist" })
      }
      else {
        // res.status(200).json({message:"Login success"}) 
        const token = jwt.sign({ _id: savedUser._id }, authKeys.jwtSecretKey);
        res.json({
          token: token,
          type: savedUser.type,
        });
      }
    }).catch((err) => {
      console.log(err)
    })
  }
});






// Flutter Login Routing
router.post("/loginflutter", (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(422).json({ error: "Please fill all the fields" })
  } else {
    User.findOne({ email }).then((savedUser) => {
      if (!savedUser) {
        res.status(422).json({ error: "Invalid email or password" })
      }
      else {
        bcrypt.compare(password, savedUser.password).then((doMatch) => {
          if (doMatch) {
            res.status(200).json({ message: "Login Successful" })
          }
          else {
            res.status(422).json({ error: "Invalid email or password" })
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  }
})

module.exports = router;
