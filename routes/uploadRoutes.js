const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const jwtAuth = require("../lib/jwtAuth");
const JobApplicant = require("../db/JobApplicant");
const Recruiter = require("../db/Recruiter");

const pipeline = promisify(require("stream").pipeline);

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const router = express.Router();

var AWS = require("../lib/aws");
const singleUpload = AWS.upload.single("image");


// var resumestorage = multer.diskStorage({
//   destination:function(req,file,cb){
//     cb(null,"public/resume")
//   },
//   filename:function(req,file,cb){
//     cb(null,Date.now()+"-"+file.originalname)
//   }
// })
// var resumeupload = multer({
//   storage: resumestorage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype == "application/pdf") {
//       cb(null, true);
//     }
//     else {
//       cb(null, false);
//       return cb(new Error('Only .pdf format allowed!'));
//     }
//   },
//   limits: { fileSize: 1 * 1024 * 1024 }
// })


// const uploadReusme = resumeupload.single("file");
// router.post("/resume",jwtAuth, (req, res) => {
//   let user = req.user;
//   uploadReusme(req, res, function (err) {
//     if (err) {
//         return res.status(400).json({ message: err.message })
//     }
//   else{
//     const { file } = req;
//     if(!file){
//       return false
//     }
//     if (user.type == "applicant") {
//       JobApplicant.findOne({ userId: user._id })
//       .then((jobApplicant) => {
//          jobApplicant.resume.filename = file.filename
//          jobApplicant
//          .save()
//          .then((result) => {
//           console.log(result)
//            res.json({
//              message: "uploaded successfully",
//            });
//          })
//          .catch((err) => {
//            res.status(400).json(err);
//          });
//       })
//     } 
//   }
// })
// });

/* API for mobile */
router.post(
  "/upload",
  [jwtAuth, singleUpload],
  function (req, res, next) {
    try {
      console.log('11111');
      let uploadedFile = req.file;
      if (uploadedFile) {
        return res.status(200).json({
          message: "succefully uploaded image",
          imageUrl: uploadedFile.key,
        });
      } else {
        return res.status(422).json({ message: "cannot upload file" });
      }
    } catch (error) {
      next(error);
    }
  }
);


router.post("/test", upload.single("image"), async (req, res) => {
  console.log("calling")
    // Upload image to cloudinary
    console.log(req.file.path)
    const result = await cloudinary.uploader.upload(req.file.path);

    res.json(result)
});


router.post("/profile",jwtAuth, async(req, res) => {
  console.log("calling")
   let user = req.user;
  // Upload image to cloudinary
  // if(req.file == null){
  //   return false
  // }else{
  // const result = await cloudinary.uploader.upload(req.file.path);
    if (user.type == "applicant") {
      JobApplicant.findOne({ userId: user._id })
      .then((jobApplicant) => {
         if(jobApplicant.employment.length>0){
          jobApplicant.profileImage = req.body.profileImage
          jobApplicant.resume.url  = req.body.resume
          jobApplicant.employment[0].expLetter=req.body.expLetter
          jobApplicant.employment[0].offerLetter=req.body.offerLetter
          jobApplicant.employment[0].BankStatement=req.body.BankStatement
          jobApplicant.employment[0].salaryslip=req.body.salaryslip
          //file name
          jobApplicant.resume.filename  = req.body.resumeName
          jobApplicant.employment[0].expLetter=req.body.expLetterName
          jobApplicant.employment[0].offerLetter=req.body.offerLetterName
          jobApplicant.employment[0].BankStatement=req.body.BankStatementName
          jobApplicant.employment[0].salaryslip=req.body.salaryslipName
        }
        else{
          // console.log('in else')
          jobApplicant.resume.filename  = req.body.resumeName
          jobApplicant.employment.push({});
          jobApplicant.profileImage = req.body.profileImage
          jobApplicant.resume.url  = req.body.resume
          jobApplicant.employment[0].expLetter=req.body.expLetter
          jobApplicant.employment[0].offerLetter=req.body.offerLetter
          jobApplicant.employment[0].BankStatement=req.body.BankStatement
          jobApplicant.employment[0].salaryslip=req.body.salaryslip
          //file name
          jobApplicant.resume.filename  = req.body.resumeName
          jobApplicant.employment[0].expLetter=req.body.expLetterName
          jobApplicant.employment[0].offerLetter=req.body.offerLetterName
          jobApplicant.employment[0].BankStatement=req.body.BankStatementName
          jobApplicant.employment[0].salaryslip=req.body.salaryslipName
        }
         jobApplicant
         .save()
         .then((result) => {
           res.json({
             message: "uploaded successfully",
             image:req.body.offerLetter
           });
         })
         .catch((err) => {
           res.status(400).json(err);
         });
      })
    } else {
    Recruiter.findOne({ userId: user._id })
    .then((recruiter)=>{
      recruiter.profileImage = req.body.profileImage;
      recruiter.save().then((result) => {
         res.json({  
        message: "uploaded successfully",
        image:req.body.profileImage })
      }).catch((err) => {
        res.status(400).json(err);
      });
    }) 
}
});

router.post("/resume",jwtAuth, async(req, res)=> {
  console.log("resume api calling")
   let user = req.user;
   console.log(req.body.resume)
  // Upload resume to cloudinary
 /*  if(req.body.resume == null){
    return false
  }else{ */
    // const result = await cloudinary.uploader.upload(req.file.path);
    if (user.type == "applicant") {
      JobApplicant.findOne({ userId: user._id })
      .then((jobApplicant) => {
        jobApplicant.resume.url  = req.body.resume
        jobApplicant.resume.filename  = req.body.resume
         jobApplicant
         .save()
         .then((result) => {
           res.json({
             message: "uploaded successfully",
             image:req.body.resume
           });
         })
         .catch((err) => {
           res.status(400).json(err);
         });
      })
    }
  // }
});

router.post("/jobdescription",jwtAuth, async(req, res)=> {
  console.log("jobdescription api calling")
   let user = req.user;
   console.log(user,'user')
   Recruiter.findOne({ userId: user._id })
   .then((recruiter)=>{
     console.log(recruiter,'e')
     recruiter.jobDescription.url = req.body.url;
     recruiter.jobDescription.filename=req.body.filename;
     recruiter.save().then((result) => {
        res.json({  
       message: "uploaded successfully",
      })
     }).catch((err) => {
       res.status(400).json(err);
     });
   }) 
  // }
});

module.exports = router;