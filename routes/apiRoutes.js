const express = require("express");
const mongoose = require("mongoose");
const jwtAuth = require("../lib/jwtAuth");
const multer = require("multer");
const AWS = require("../lib/aws");
const optionalAuth = require("../lib/optionalAuth");
const User = require("../db/User");
const JobApplicant = require("../db/JobApplicant");
const Recruiter = require("../db/Recruiter");
const Job = require("../db/Job");
const Sysjob = require("../db/Sysjob");
const Dayjob = require("../db/Dayjob");
const Application = require("../db/Application");
const Rating = require("../db/Rating");
const WishList = require("../db/WishList");
const router = express.Router();
const bcrypt = require("bcrypt")
const singleUpload = AWS.upload.single("file");
const subscription=require('../db/subsciption')


const formidable = require('formidable')
const { v4: uuidv4 } = require('uuid')
const https = require('https')
const PaytmChecksum = require('./PaytmChecksum');
const JobAlerts = require("../db/JobAlerts");





// To add new job
router.post("/jobs", jwtAuth, async (req, res) => {
  const user = req.user;

  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to add jobs",
    });
    return;
  }
  let recruiterInfo = await Recruiter.find({
    userId: user._id
  })
  const data = req.body;
  let job = new Job({
    userId: user._id,
    title: data.title,
    maxPositions: data.maxPositions,
    // dateOfPosting: data.dateOfPosting,
    deadline: data.deadline,
    skillsets: data.skillsets,
    jobType: data.jobType,
    salary: data.salary,
    rating: data.rating,
    experience: data.experience,
    cities: data.cities,
    country: data.country,
    education: data.education,
    description: data.description,
    industryType: recruiterInfo.organizationType,
    postedAt: new Date().getTime()
  });

  console.log("testssss")


  job
    .save()
    .then(async (data) => {
      let users = await JobApplicant.find({ skills: { $in: data.skillsets } })
      console.log('uuuu ', users);
      let jobAlertsList = users.map(user => {
        let jobAlert = {
          userId: user.userId,
          jobId: data._id
        }
        return jobAlert;
      })
      console.log('jjjj ', jobAlertsList);
      await JobAlerts.insertMany(jobAlertsList);
      res.json({ message: "Job added successfully to the database" });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


//to add sys job post


router.post("/sys", jwtAuth, async (req, res) => {
  const user = req.user;

  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to add sysjobs",
    });
    return;
  }
  let JobApplicantInfo = await JobApplicant.find({
    userId: user._id
  })
  const data = req.body;
  let sysjob = new Sysjob({

    userId: user._id,
    title: data.title,
    trainingType: data.trainingType,
    experience: data.experience,
    time: data.time,
    description: data.description,
    fees: data.fees,
    cities: data.cities,
    // industryType: JobApplicantInfo.organizationType,
    postedAt: new Date().getTime()
  });

  console.log("test sell your skill")


  sysjob
    .save()
    .then(async (data) => {
      let users = await JobApplicant.find({ skills: { $in: data.skillsets } })
      // console.log('uuuu ', users);
      let sysjobAlertsList = users.map(user => {
        let sysjobAlert = {
          userId: user.userId,
          jobId: data._id
        }
        return sysjobAlert;
      })
      console.log('jjjj ', sysjobAlertsList);
      await JobAlerts.insertMany(sysjobAlertsList);
      res.json({ message: "Skill added successfully to the database" });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


//to post Day job


router.post("/dayjob", jwtAuth, async (req, res) => {
  const user = req.user;

  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to post a day job",
    });
    return;
  }
  let JobApplicantInfo = await JobApplicant.find({
    userId: user._id
  })
  const data = req.body;
  let dayjob = new Dayjob({

    userId: user._id,
    day_title: data.day_title,
    day_jobType: data.day_jobType,
    day_experience: data.day_experience,
    day_time: data.day_time,
    day_description: data.day_description,
    day_salary: data.day_salary,
    day_cities: data.day_cities,
    // industryType: JobApplicantInfo.organizationType,
    postedAt: new Date().getTime()
  });

  console.log("test day job")


  dayjob
    .save()
    .then(async (data) => {
      let users = await JobApplicant.find({ skills: { $in: data.skillsets } })
      // console.log('uuuu ', users);
      let dayjobAlertsList = users.map(user => {
        let dayjobAlert = {
          userId: user.userId,
          jobId: data._id
        }
        return dayjobAlert;
      })
      console.log('jjjj ', dayjobAlertsList);
      await JobAlerts.insertMany(dayjobAlertsList);
      res.json({ message: "Day Job added successfully to the database" });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});



// alljobs without middleware
router.get('/alljobs', (req, res) => {
  arr = [
    {
      $lookup: {
        from: "recruiterinfos",
        localField: "userId",
        foreignField: "userId",
        as: "recruiter",
      },
    },
    { $unwind: "$recruiter" },
  ];


  Job.aggregate(arr)
    .then((posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      res.json(posts);
    })
    .catch((err) => {
      res.status(400).json(err);
    });


  // Job.find({}).then(result=>res.json(result))
})


// to get all the jobs [pagination] [for recruiter personal and for everyone]
router.get("/jobs", jwtAuth, (req, res) => {
  let user = req.user;
  let findParams = {};
  let sortParams = {};
  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  
  console.log(req.query.q)
  if (user.type === "recruiter" && req.query.myjobs) {
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.query.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.query.q, "i"),
      },
    };
  }

  if (req.query.jobType) {
    let jobTypes = [];
    if (Array.isArray(req.query.jobType)) {
      jobTypes = req.query.jobType;
    } else {
      jobTypes = [req.query.jobType];
    }
    // console.log(jobTypes);
    findParams = {
      ...findParams,
      jobType: {
        $in: jobTypes,
      },
    };
  }

  if (req.query.salaryMin && req.query.salaryMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          salary: {
            $gte: parseInt(req.query.salaryMin),
          },
        },
        {
          salary: {
            $lte: parseInt(req.query.salaryMax),
          },
        },
      ],
    };
  } else if (req.query.salaryMin) {
    findParams = {
      ...findParams,
      salary: {
        $gte: parseInt(req.query.salaryMin),
      },
    };
  } else if (req.query.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        $lte: parseInt(req.query.salaryMax),
      },
    };
  }

  if (req.query.duration) {
    findParams = {
      ...findParams,
      duration: {
        $lt: parseInt(req.query.duration),
      },
    };
  }

  if (req.query.asc) {
    if (Array.isArray(req.query.asc)) {
      req.query.asc.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: 1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.asc]: 1,
      };
    }
  }

  if (req.query.desc) {
    if (Array.isArray(req.query.desc)) {
      req.query.desc.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: -1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.desc]: -1,
      };
    }
  }

  // console.log(findParams);
  // console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  let arr = [
    {
      $lookup: {
        from: "recruiterinfos",
        localField: "userId",
        foreignField: "userId",
        as: "recruiter",
      },
    },
    { $unwind: "$recruiter" },
    { $match: findParams },
  ];

  if (Object.keys(sortParams).length > 0) {
    arr = [
      {
        $lookup: {
          from: "recruiterinfos",
          localField: "userId",
          foreignField: "userId",
          as: "recruiter",
        },
      },
      { $unwind: "$recruiter" },
      { $match: findParams },
      {
        $sort: sortParams,
      },
    ];
  }

  // console.log(arr);

  Job.aggregate(arr)
    .then((posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      // posts.map((post)=>
      // {
      //   Application.aggregate({jobId:post._id})
      //   .then((result)=> console.log(result))
      // })
      res.json(posts)
      // console.log(posts)
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});



// to get all the SYS jobs [pagination] [for recruiter personal and for everyone]
router.get("/sys", jwtAuth, (req, res) => {
  let user = req.user;
  let findParams = {};
  let sortParams = {};
  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  console.log(req.query.q)
  if (user.type === "applicant" && req.query.sysjobs) {
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.query.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.query.q, "i"),
      },
    };
  }

  if (req.query.trainingType) {
    let sysJobTypes = [];
    if (Array.isArray(req.query.trainingType)) {
      sysJobTypes = req.query.trainingType;
    } else {
      sysJobTypes = [req.query.trainingType];
    }
    // console.log(jobTypes);
    findParams = {
      ...findParams,
      trainingType: {
        $in: sysJobTypes,
      },
    };
  }
   
  // if (req.query.salaryMin && req.query.salaryMax) {
  //   findParams = {
  //     ...findParams,
  //     $and: [
  //       {
  //         salary: {
  //           $gte: parseInt(req.query.salaryMin),
  //         },
  //       },
  //       {
  //         salary: {
  //           $lte: parseInt(req.query.salaryMax),
  //         },
  //       },
  //     ],
  //   };
  // } else if (req.query.salaryMin) {
  //   findParams = {
  //     ...findParams,
  //     salary: {
  //       $gte: parseInt(req.query.salaryMin),
  //     },
  //   };
  // } else if (req.query.salaryMax) {
  //   findParams = {
  //     ...findParams,
  //     salary: {
  //       $lte: parseInt(req.query.salaryMax),
  //     },
  //   };
  // }

  if (req.query.time) {
    findParams = {
      ...findParams,
      time: {
        $lt: parseInt(req.query.time),
      },
    };
  }

  if (req.query.experience) {
    findParams = {
      ...findParams,
      experience: {
        $lt: parseInt(req.query.experience),
      },
    };
  }

  if (req.query.description) {
    findParams = {
      ...findParams,
      description: {
        $lt: parseInt(req.query.description),
      },
    };
  }

  if (req.query.fees) {
    findParams = {
      ...findParams,
      fees: {
        $lt: parseInt(req.query.fees),
      },
    };
  }



  if (req.query.cities) {
    if (Array.isArray(req.query.cities)) {
      req.query.cities.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: 1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.cities]: 1,
      };
    }
  }

  // if (req.query.desc) {
  //   if (Array.isArray(req.query.desc)) {
  //     req.query.desc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: -1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.desc]: -1,
  //     };
  //   }
  // }

  // console.log(findParams);
  // console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  let arr = [
    {
      $lookup: {
        from: "applicantinfos",
        localField: "userId",
        foreignField: "userId",
        as: "applicant",
      },
    },
    { $unwind: "$applicant" },
    { $match: findParams },
  ];

  if (Object.keys(sortParams).length > 0) {
    arr = [
      {
        $lookup: {
          from: "applicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "applicant",
        },
      },
      { $unwind: "$applicant" },
      { $match: findParams },
      {
        $sort: sortParams,
      },
    ];
  }

  // console.log(arr);

  Job.aggregate(arr)
    .then((posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      // posts.map((post)=>
      // {
      //   Application.aggregate({jobId:post._id})
      //   .then((result)=> console.log(result))
      // })
      res.json(posts)
      // console.log(posts)
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});




// to get all the jobs [pagination] [for recruiter personal and for everyone]
router.post("/jobs/search", optionalAuth, (req, res) => {
  let user = req.user;
  console.log(req.query.myjobs, 'jobs')
  let findParams = {};
  let sortParams = {};
  var limit = 20;
  var offset = 0;

  if (typeof req.query.page !== 'undefined') {
    page = req.query.page;
    offset = limit * page
  }
  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  console.log(req.query.q)
  if (user && user.type === "recruiter" && req.query.myjobs) {
    console.log('aaa');
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.body.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.body.q, "i"),
      },
    };
  }

  if (req.body.qlocation) {

    findParams = {
      ...findParams,
      cities: {
        $regex: new RegExp(req.body.qlocation, "i"),
      },
    };
  }

  var optRegexp = [];
  for (const location of req.body.location) {
    optRegexp.push(new RegExp(location, "i"));
  }

  if (req.body.location && req.body.location.length !== 0) {
    findParams = {
      ...findParams,
      cities: { "$in": optRegexp },
    };
  }

  if (req.body.industryType && req.body.industryType.length !== 0) {
    findParams = {
      ...findParams,
      industryType: { "$in": req.body.industryType }
    };
  }

  var categoryRegexp = [];
  for (const category of req.body.category) {
    categoryRegexp.push(new RegExp(category, "i"));
  }

  if (req.body.category && req.body.category.length !== 0) {
    findParams = {
      ...findParams,
      title: { "$in": categoryRegexp },
    };
  }

  if (req.body.companies && req.body.companies.length !== 0) {
    findParams = {
      ...findParams,
      userId: { "$in": req.body.companies }
    };
  }

  var optEducationRegexp = [];
  for (const educations of req.body.educations) {
    optEducationRegexp.push(new RegExp(educations, "i"));
  }

  if (req.body.educations && req.body.educations.length !== 0) {
    findParams = {
      ...findParams,
      education: { "$in": optEducationRegexp },
    };
  }

  if (req.body.skills && req.body.skills.length !== 0) {
    findParams = {
      ...findParams,
      skillsets: { "$in": req.body.skills },
    };
  }

  if (req.query.jobType) {
    let jobTypes = [];
    if (Array.isArray(req.query.jobType)) {
      jobTypes = req.query.jobType;
    } else {
      jobTypes = [req.query.jobType];
    }
    // console.log(jobTypes);
    findParams = {
      ...findParams,
      jobType: {
        $in: jobTypes,
      },
    };
  }

  if (req.body.salaryMin && req.body.salaryMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          salary: {
            $gte: parseInt(req.body.salaryMin),
          },
        },
        {
          salary: {
            $lte: parseInt(req.body.salaryMax),
          },
        },
      ],
    };
  } else if (req.body.salaryMin) {
    findParams = {
      ...findParams,
      salary: {
        $gte: parseInt(req.body.salaryMin),
      },
    };
  } else if (req.body.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        $lte: parseInt(req.body.salaryMax),
      },
    };
  }

  // var salaryArr = []
  // for (const salary of req.body.salaries) {
  //   // optEducationRegexp.push(  new RegExp(educations, "i") );
  //   salaryArr.push({
  //     $and: [
  //       {
  //         salary: {
  //           $gte: parseInt(salary.salaryMin),
  //         },
  //       },
  //       {
  //         salary: {
  //           $lte: parseInt(salary.salaryMax),
  //         },
  //       },
  //     ],
  //   })
  // }


  // if (req.body.salaries && req.body.salaries.length !== 0) {
  //   console.log('salaryArr',salaryArr[0].$and);
  //   findParams = {
  //     ...findParams,
  //     salary: salaryArr
  //   };
  // }

  // if (req.query.duration) {
  //   findParams = {
  //     ...findParams,
  //     duration: {
  //       $lt: parseInt(req.query.duration),
  //     },
  //   };
  // }

  // if (req.query.asc) {
  //   if (Array.isArray(req.query.asc)) {
  //     req.query.asc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: 1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.asc]: 1,
  //     };
  //   }
  // }

  // if (req.query.desc) {
  //   if (Array.isArray(req.query.desc)) {
  //     req.query.desc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: -1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.desc]: -1,
  //     };
  //   }
  // }

  // console.log(findParams);
  // console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  // let arr = [
  //   {
  //     $lookup: {
  //       from: "recruiterinfos",
  //       localField: "userId",
  //       foreignField: "userId",
  //       as: "recruiter",
  //     },
  //   },
  //   { $unwind: "$recruiter" },
  //   { $match: findParams },
  // ];

  // if (Object.keys(sortParams).length > 0) {
  //   arr = [
  //     {
  //       $lookup: {
  //         from: "recruiterinfos",
  //         localField: "userId",
  //         foreignField: "userId",
  //         as: "recruiter",
  //       },
  //     },
  //     { $unwind: "$recruiter" },
  //     { $match: findParams },
  //     {
  //       $sort: sortParams,
  //     },
  //   ];
  // }

  // console.log(arr);

  Job.find(findParams)
    .limit(Number(limit))
    .skip(Number(offset))
    .sort({ dateOfPosting: -1 })
    .lean()
    .then(async (posts) => {
      let counts = await Job.count(findParams).exec()
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      // if (req.body.salaries && req.body.salaries.length !== 0) {
      //   posts = posts.filter(post => {
      //     let flag = false
      //     for (const salary of req.body.salaries) {
      //       if (salary.salaryMin <= post.salary && salary.salaryMax >= post.salary) {
      //         flag = true
      //       }
      //     }
      //     return flag;
      //   })
      // }


      posts = await Promise.all(
        posts.map(async post => {
          post.recruiter = await Recruiter.findOne({ userId: post.userId });
          let result = await WishList.findOne({ userId: req.user._id, jobId: post._id })
          console.log('result ', post.userId);
          post.wishlist = result ? true : false
          return post;
        })
      )

      res.json({ posts, counts });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


// to get all the jobs [pagination] [for recruiter personal and for everyone]
router.post("/sys/search", optionalAuth, (req, res) => {
  let user = req.user;
  console.log(req.query.myjobs, 'jobs')
  let findParams = {};
  let sortParams = {};
  var limit = 20;
  var offset = 0;

  if (typeof req.query.page !== 'undefined') {
    page = req.query.page;
    offset = limit * page
  }
  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  console.log(req.query.q)
  if (user && user.type === "applicant" && req.query.myjobs) {
    console.log('aaa');
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.body.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.body.q, "i"),
      },
    };
  }

  if (req.body.qlocation) {

    findParams = {
      ...findParams,
      cities: {
        $regex: new RegExp(req.body.qlocation, "i"),
      },
    };
  }

  var optRegexp = [];
  for (const location of req.body.location) {
    optRegexp.push(new RegExp(location, "i"));
  }

  if (req.body.location && req.body.location.length !== 0) {
    findParams = {
      ...findParams,
      cities: { "$in": optRegexp },
    };
  }

  if (req.body.industryType && req.body.industryType.length !== 0) {
    findParams = {
      ...findParams,
      industryType: { "$in": req.body.industryType }
    };
  }

  var categoryRegexp = [];
  for (const category of req.body.category) {
    categoryRegexp.push(new RegExp(category, "i"));
  }

  if (req.body.category && req.body.category.length !== 0) {
    findParams = {
      ...findParams,
      title: { "$in": categoryRegexp },
    };
  }

  if (req.body.companies && req.body.companies.length !== 0) {
    findParams = {
      ...findParams,
      userId: { "$in": req.body.companies }
    };
  }

  var optEducationRegexp = [];
  for (const educations of req.body.educations) {
    optEducationRegexp.push(new RegExp(educations, "i"));
  }

  if (req.body.educations && req.body.educations.length !== 0) {
    findParams = {
      ...findParams,
      education: { "$in": optEducationRegexp },
    };
  }

  if (req.body.skills && req.body.skills.length !== 0) {
    findParams = {
      ...findParams,
      skillsets: { "$in": req.body.skills },
    };
  }

  if (req.query.jobType) {
    let jobTypes = [];
    if (Array.isArray(req.query.jobType)) {
      jobTypes = req.query.jobType;
    } else {
      jobTypes = [req.query.jobType];
    }
    // console.log(jobTypes);
    findParams = {
      ...findParams,
      jobType: {
        $in: jobTypes,
      },
    };
  }

  if (req.body.salaryMin && req.body.salaryMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          salary: {
            $gte: parseInt(req.body.salaryMin),
          },
        },
        {
          salary: {
            $lte: parseInt(req.body.salaryMax),
          },
        },
      ],
    };
  } else if (req.body.salaryMin) {
    findParams = {
      ...findParams,
      salary: {
        $gte: parseInt(req.body.salaryMin),
      },
    };
  } else if (req.body.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        $lte: parseInt(req.body.salaryMax),
      },
    };
  }

  // var salaryArr = []
  // for (const salary of req.body.salaries) {
  //   // optEducationRegexp.push(  new RegExp(educations, "i") );
  //   salaryArr.push({
  //     $and: [
  //       {
  //         salary: {
  //           $gte: parseInt(salary.salaryMin),
  //         },
  //       },
  //       {
  //         salary: {
  //           $lte: parseInt(salary.salaryMax),
  //         },
  //       },
  //     ],
  //   })
  // }


  // if (req.body.salaries && req.body.salaries.length !== 0) {
  //   console.log('salaryArr',salaryArr[0].$and);
  //   findParams = {
  //     ...findParams,
  //     salary: salaryArr
  //   };
  // }

  // if (req.query.duration) {
  //   findParams = {
  //     ...findParams,
  //     duration: {
  //       $lt: parseInt(req.query.duration),
  //     },
  //   };
  // }

  // if (req.query.asc) {
  //   if (Array.isArray(req.query.asc)) {
  //     req.query.asc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: 1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.asc]: 1,
  //     };
  //   }
  // }

  // if (req.query.desc) {
  //   if (Array.isArray(req.query.desc)) {
  //     req.query.desc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: -1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.desc]: -1,
  //     };
  //   }
  // }

  // console.log(findParams);
  // console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  // let arr = [
  //   {
  //     $lookup: {
  //       from: "recruiterinfos",
  //       localField: "userId",
  //       foreignField: "userId",
  //       as: "recruiter",
  //     },
  //   },
  //   { $unwind: "$recruiter" },
  //   { $match: findParams },
  // ];

  // if (Object.keys(sortParams).length > 0) {
  //   arr = [
  //     {
  //       $lookup: {
  //         from: "recruiterinfos",
  //         localField: "userId",
  //         foreignField: "userId",
  //         as: "recruiter",
  //       },
  //     },
  //     { $unwind: "$recruiter" },
  //     { $match: findParams },
  //     {
  //       $sort: sortParams,
  //     },
  //   ];
  // }

  // console.log(arr);

  Job.find(findParams)
    .limit(Number(limit))
    .skip(Number(offset))
    .sort({ dateOfPosting: -1 })
    .lean()
    .then(async (posts) => {
      let counts = await Job.count(findParams).exec()
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      // if (req.body.salaries && req.body.salaries.length !== 0) {
      //   posts = posts.filter(post => {
      //     let flag = false
      //     for (const salary of req.body.salaries) {
      //       if (salary.salaryMin <= post.salary && salary.salaryMax >= post.salary) {
      //         flag = true
      //       }
      //     }
      //     return flag;
      //   })
      // }


      posts = await Promise.all(
        posts.map(async post => {
          post.recruiter = await Recruiter.findOne({ userId: post.userId });
          let result = await WishList.findOne({ userId: req.user._id, jobId: post._id })
          console.log('result ', post.userId);
          post.wishlist = result ? true : false
          return post;
        })
      )

      res.json({ posts, counts });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});



router.get("/company/list/filter", async (req, res) => {
  let companies = await Recruiter.find({}, 'companyname userId').sort({ _id: -1 })
  return res.json({ companies })
})

router.get("/company/list", async (req, res) => {
  let find = {}
  if (req.query.q) {
    console.log('req.query.q', req.query.q);
    find = { companyname: { $regex: '^' + req.query.q, $options: 'i' } }
  }
  console.log('find ', find);
  let companies = await Recruiter.find(find, 'companyname userId').sort({ _id: -1 })
  return res.json({ companies })
});

router.get("/skills/list", async (req, res) => {
  let skills = await JobApplicant.find({}).distinct('skills')
  return res.json({ skills })
});

router.get("/search/list/:type", async (req, res) => {
  let { type } = req.params;
  let data;
  data = await Job.find().distinct(type)
  return res.json({ data })
})

// to get info about a particular job  jwtAuth
router.get("/jobs/:id", (req, res) => {

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  Application.findOne({ jobId: req.params.id })
    .then((applications) => {
      console.log(applications)
    })
    .catch((err) => {
      res.status(400).json(err);
    });
  console.log(req.params.id)
  Job.findOne({ _id: req.params.id })
    .then((job) => {
      if (job == null) {
        res.status(400).json({
          message: "Job does not exist",
        });
        return;
      }
      // console.log(job)
      Recruiter.findOne({ userId: job.userId })
        .then((result) => res.json({ job: job, postedby: result }))
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// to get info about a particular job  jwtAuth
router.get("/sys/:id", (req, res) => {

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  Application.findOne({ jobId: req.params.id })
    .then((applications) => {
      console.log(applications)
    })
    .catch((err) => {
      res.status(400).json(err);
    });
  console.log(req.params.id)
  Job.findOne({ _id: req.params.id })
    .then((job) => {
      if (job == null) {
        res.status(400).json({
          message: "Job does not exist",
        });
        return;
      }
      // console.log(job)
      Recruiter.findOne({ userId: job.userId })
        .then((result) => res.json({ job: job, postedby: result }))
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


// to update info of a particular job
router.put("/jobs/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to change the job details",
    });
    return;
  }
  Job.findOne({
    _id: req.params.id,
    userId: user.id,
  })
    .then((job) => {
      if (job == null) {
        res.status(404).json({
          message: "Job does not exist",
        });
        return;
      }
      const data = req.body;
      if (data.title) {
        job.title = data.title
      }
      if (data.maxPositions) {
        job.maxPositions = data.maxPositions;
      }
      if (data.jobType) {
        job.jobType = data.jobType
      }
      if (data.experience) {
        job.experience = data.experience
      }
      if (data.country) {
        job.country = data.country
      }
      if (data.deadline) {
        job.deadline = data.deadline;
      }
      if (data.education) {
        job.education = data.education
      }
      if (data.description) {
        job.description = data.description
      }
      if (data.salary) {
        job.salary = data.salary
      }
      if (data.skillsets) {
        job.skillsets = data.skillsets
      }
      if (data.cities) {
        job.cities = data.cities
      }
      if (data.careerprofile) {
        job.careerprofile = data.careerprofile
      }

      job
        .save()
        .then(() => {
          res.json({
            message: "Job details updated successfully",
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


// to update info of a SYS job
router.put("/sys/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to change the job details",
    });
    return;
  }
  Job.findOne({
    _id: req.params.id,
    userId: user.id,
  })
    .then((job) => {
      if (job == null) {
        res.status(404).json({
          message: "Job does not exist",
        });
        return;
      }
      const data = req.body;
      if (data.title) {
        job.title = data.title
      }
      if (data.trainingType) {
        job.trainingType = data.trainingType;
      }
      if (data.experience) {
        job.experience = data.experience
      }
      if (data.time) {
        job.time = data.time
      }
      if (data.description) {
        job.description = data.description
      }
      if (data.fees) {
        job.fees = data.fees;
      }
      // if (data.education) {
      //   job.education = data.education
      // }
      // if (data.description) {
      //   job.description = data.description
      // }
      // if (data.salary) {
      //   job.salary = data.salary
      // }
      // if (data.skillsets) {
      //   job.skillsets = data.skillsets
      // }
      if (data.cities) {
        job.cities = data.cities
      }
      // if (data.careerprofile) {
      //   job.careerprofile = data.careerprofile
      // }

      job
        .save()
        .then(() => {
          res.json({
            message: "Job details updated successfully",
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});



// to delete a job
router.delete("/jobs/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to delete the job",
    });
    return;
  }
  Job.findOneAndDelete({
    _id: req.params.id,
    userId: user.id,
  })
    .then((job) => {
      if (job === null) {
        res.status(401).json({
          message: "You don't have permissions to delete the job",
        });
        return;
      }
      res.json({
        message: "Job deleted successfully",
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// to delete a SYSjob
router.delete("/sys/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the job",
    });
    return;
  }
  Job.findOneAndDelete({
    _id: req.params.id,
    userId: user.id,
  })
    .then((job) => {
      if (job === null) {
        res.status(401).json({
          message: "You don't have permissions to delete the job",
        });
        return;
      }
      res.json({
        message: "Job deleted successfully",
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// to delete employment
router.delete("/user/:id/employment", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { employment: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to update employment
router.put("/user/:id/employment", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "employment._id": req.params.id },
    {
      $set: {
        "employment.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to delete Education
router.delete("/user/:id/education", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { education: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to delete Project
router.delete("/user/:id/project", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { project: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to update education
router.put("/user/:id/education", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "education._id": req.params.id },
    {
      $set: {
        "education.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to update project
router.put("/user/:id/project", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "project._id": req.params.id },
    {
      $set: {
        "project.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to update worksample
router.put("/user/:id/worksample", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "worksample._id": req.params.id },
    {
      $set: {
        "worksample.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to delete worksample
router.delete("/user/:id/worksample", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { worksample: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});


// to delete presentation
router.delete("/user/:id/presentation", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { presentation: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to update Presentation
router.put("/user/:id/presentation", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "presentation._id": req.params.id },
    {
      $set: {
        "presentation.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to delete publication
router.delete("/user/:id/publication", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { publication: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to update publication
router.put("/user/:id/publication", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "publication._id": req.params.id },
    {
      $set: {
        "publication.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to delete patent
router.delete("/user/:id/patent", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { patent: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to update patent
router.put("/user/:id/patent", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "patent._id": req.params.id },
    {
      $set: {
        "patent.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// to delete certification
router.delete("/user/:id/certification", jwtAuth, (req, res) => {
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id },
    { $pull: { certification: { _id: req.params.id } } },
    { new: true }
  ).then((result) => {
    res.json("deleted sucessfully")
  })
});

// to update certification
router.put("/user/:id/certification", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "certification._id": req.params.id },
    {
      $set: {
        "certification.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});


// to update career profile
router.put("/user/:id/careerprofile", jwtAuth, (req, res) => {
  // console.log(req.body)
  const user = req.user;
  console.log(req.params.id)
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to delete the details",
    });
    return;
  }
  JobApplicant.findOneAndUpdate({ userId: user._id, "careerprofile._id": req.params.id },
    {
      $set: {
        "careerprofile.$": req.body,
      }
    }
  ).then((result) => {
    res.json("updated successfully")
  })
});

// get user's personal details
router.get("/user", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    Recruiter.findOne({ userId: user._id })
      .then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(recruiter);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    JobApplicant.findOne({ userId: user._id })
      .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(jobApplicant);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

// get user details from id
router.get("/user/:id", jwtAuth, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((userData) => {
      if (userData === null) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }

      if (userData.type === "recruiter") {
        Recruiter.findOne({ userId: userData._id })
          .then((recruiter) => {
            if (recruiter === null) {
              res.status(404).json({
                message: "User does not exist",
              });
              return;
            }
            res.json(recruiter);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        JobApplicant.findOne({ userId: userData._id })
          .then((jobApplicant) => {
            if (jobApplicant === null) {
              res.status(404).json({
                message: "User does not exist",
              });
              return;
            }
            res.json(jobApplicant);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// update user details
router.put("/user", jwtAuth, (req, res) => {
  const user = req.user;
  const data = req.body;
  console.log(data)
  if (user.type == "recruiter") {
    Recruiter.findOne({ userId: user._id })
      .then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        if (data.companyname) {
          recruiter.companyname = data.companyname;
        }
        if (data.websitelink) {
          recruiter.websitelink = data.websitelink;
        }
        if (data.foundedDate) {
          recruiter.foundedDate = data.foundedDate;
        }
        if (data.organizationType) {
          recruiter.organizationType = data.organizationType;
        }
        if (data.country) {
          recruiter.country = data.country;
        }
        if (data.contactNumber) {
          recruiter.contactNumber = data.contactNumber;
        }
        if (data.description) {
          recruiter.description = data.description;
        }
        if (data.email) {
          recruiter.email = data.email;
        }
        if (data.state) {
          recruiter.state = data.state;
        }
        if (data.address) {
          recruiter.address = data.address;
        }
        if (data.pincode) {
          recruiter.pincode = data.pincode;
        }
        if (data.facebook) {
          recruiter.facebook = data.facebook;
        }
        if (data.twitter) {
          recruiter.twitter = data.twitter;
        }
        if (data.google) {
          recruiter.google = data.google;
        }
        if (data.linkedin) {
          recruiter.linkedin = data.linkedin;
        }
        if (data.city) {
          recruiter.city = data.city;
        }

        recruiter
          .save()
          .then(() => {
            res.json({
              message: "updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    JobApplicant.findOne({ userId: user._id })
      .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        if (data.name) {
          jobApplicant.name = data.name;
        }
        if (data.experience) {
          jobApplicant.experience = data.experience;
        }
        if (data.currentlocation) {
          jobApplicant.currentlocation = data.currentlocation;
        }
        if (data.contactNumber) {
          jobApplicant.contactNumber = data.contactNumber;
        }
        if (data.profileImage) {
          jobApplicant.profileImage = data.profileImage;
        }
        if (data.total_experience) {
          jobApplicant.total_experience = data.total_experience;
        }
        if (data.state) {
          jobApplicant.state = data.state;
        }
        if (data.email) {
          jobApplicant.email = data.email;
        }
        jobApplicant.profileSummary = data.profileSummary;
        if (data.skills) {
          jobApplicant.skills = data.skills;
        }
        if (data.employment) {
          jobApplicant.employment = data.employment;
        }
        if (data.personaldetails) {
          jobApplicant.personaldetails = data.personaldetails;
        }
        if (data.education) {
          jobApplicant.education = data.education;
        }
        if (data.resume) {
          jobApplicant.resume = data.resume;
        }
        if (data.profile) {
          jobApplicant.profile = data.profile
        }
        if (data.project) {
          jobApplicant.project = data.project
        }
        if (data.worksample) {
          jobApplicant.worksample = data.worksample;
        }
        if (data.presentation) {
          jobApplicant.presentation = data.presentation;
        }
        if (data.publication) {
          jobApplicant.publication = data.publication;
        }
        if (data.patent) {
          jobApplicant.patent = data.patent;
        }
        if (data.certification) {
          jobApplicant.certification = data.certification;
        }
        if (data.careerprofile) {
          jobApplicant.careerprofile = data.careerprofile;
        }
        jobApplicant.resumeHeadline = data.resumeHeadline;


        jobApplicant
          .save()
          .then(() => {
            res.json({
              message: "updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

// apply for a job [todo: test: done]
router.post("/jobs/:id/applications", jwtAuth, async (req, res) => {
  const user = req.user;

  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to apply for a job",
    });
    return;
  }
  const data = req.body;
  const jobId = req.params.id;



  // check whether applied previously
  // find job
  // check count of active applications < limit
  // check user had < 10 active applications && check if user is not having any accepted jobs (user id)
  // store the data in applications

  Application.findOne({
    userId: user._id,
    jobId: jobId,
    status: {
      $nin: ["deleted", "accepted", "cancelled"],
    },
  })
    .then((appliedApplication) => {
      console.log(appliedApplication);
      if (appliedApplication !== null) {
        res.status(400).json({
          message: "You have already applied for this job",
        });
        return;
      }

      Job.findOne({ _id: jobId })
        .then((job) => {
          if (job === null) {
            res.status(404).json({
              message: "Job does not exist",
            });
            return;
          }
          Application.countDocuments({
            jobId: jobId,
            status: {
              $nin: ["rejected", "deleted", "cancelled", "finished"],
            },
          })
            // .then((activeApplicationCount) => {
            // if (activeApplicationCount < job.maxApplicants) {
            //   Application.countDocuments({
            //     userId: user._id,
            //     status: {
            //       $nin: ["rejected", "deleted", "cancelled", "finished"],
            //     },
            //   })
            .then((myActiveApplicationCount) => {
              // console.log(myActiveApplicationCount)
              // if (myActiveApplicationCount < 10) {
              // Application.countDocuments({
              //   userId: user._id,
              //   status: "accepted",
              // }).then((acceptedJobs) => {
              //   if (acceptedJobs === 0) {
              const application = new Application({
                userId: user._id,
                recruiterId: job.userId,
                jobId: job._id,
                status: "applied",
                sop: data.sop,
              });
              application
                .save()
                .then(() => {
                  res.json({
                    message: "Job application successful",
                  });
                })
                .catch((err) => {
                  res.status(400).json(err);
                });
              // } else {
              //   res.status(400).json({
              //     message:
              //       "You already have an accepted job. Hence you cannot apply.",
              //   });
              // }
            });
          //   } else {
          //     res.status(400).json({
          //       message:
          //         "You have 10 active applications. Hence you cannot apply.",
          //     });
          //   }
          // })
          // .catch((err) => {
          //   res.status(400).json(err);
          // });
          //   } else {
          //     res.status(400).json({
          //       message: "Application limit reached",
          //     });
          //   }
        })
        .catch((err) => {
          res.status(400).json(err);
        });
      // })
      // .catch((err) => {
      //   res.status(400).json(err);
      // });
    })
    .catch((err) => {
      res.json(400).json(err);
    });
});

// apply for a job [todo: test: done]
router.post("/sys/:id/applications", jwtAuth, async (req, res) => {
  const user = req.user;

  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to apply for a job",
    });
    return;
  }
  const data = req.body;
  const jobId = req.params.id;



  // check whether applied previously
  // find job
  // check count of active applications < limit
  // check user had < 10 active applications && check if user is not having any accepted jobs (user id)
  // store the data in applications

  Application.findOne({
    userId: user._id,
    jobId: jobId,
    status: {
      $nin: ["deleted", "accepted", "cancelled"],
    },
  })
    .then((appliedApplication) => {
      console.log(appliedApplication);
      if (appliedApplication !== null) {
        res.status(400).json({
          message: "You have already applied for this job",
        });
        return;
      }

      Job.findOne({ _id: jobId })
        .then((job) => {
          if (job === null) {
            res.status(404).json({
              message: "Job does not exist",
            });
            return;
          }
          Application.countDocuments({
            jobId: jobId,
            status: {
              $nin: ["rejected", "deleted", "cancelled", "finished"],
            },
          })
            // .then((activeApplicationCount) => {
            // if (activeApplicationCount < job.maxApplicants) {
            //   Application.countDocuments({
            //     userId: user._id,
            //     status: {
            //       $nin: ["rejected", "deleted", "cancelled", "finished"],
            //     },
            //   })
            .then((myActiveApplicationCount) => {
              // console.log(myActiveApplicationCount)
              // if (myActiveApplicationCount < 10) {
              // Application.countDocuments({
              //   userId: user._id,
              //   status: "accepted",
              // }).then((acceptedJobs) => {
              //   if (acceptedJobs === 0) {
              const application = new Application({
                userId: user._id,
                recruiterId: job.userId,
                jobId: job._id,
                status: "applied",
                sop: data.sop,
              });
              application
                .save()
                .then(() => {
                  res.json({
                    message: "Job application successful",
                  });
                })
                .catch((err) => {
                  res.status(400).json(err);
                });
              // } else {
              //   res.status(400).json({
              //     message:
              //       "You already have an accepted job. Hence you cannot apply.",
              //   });
              // }
            });
          //   } else {
          //     res.status(400).json({
          //       message:
          //         "You have 10 active applications. Hence you cannot apply.",
          //     });
          //   }
          // })
          // .catch((err) => {
          //   res.status(400).json(err);
          // });
          //   } else {
          //     res.status(400).json({
          //       message: "Application limit reached",
          //     });
          //   }
        })
        .catch((err) => {
          res.status(400).json(err);
        });
      // })
      // .catch((err) => {
      //   res.status(400).json(err);
      // });
    })
    .catch((err) => {
      res.json(400).json(err);
    });
});


// recruiter gets applications for a particular job [pagination] [todo: test: done]
router.get("/jobs/:id/applications", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to view job applications",
    });
    return;
  }
  const jobId = req.params.id;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  let findParams = {
    jobId: jobId,
    recruiterId: user._id,
  };

  let sortParams = {};

  if (req.query.status) {
    findParams = {
      ...findParams,
      status: req.query.status,
    };
  }

  Application.find(findParams)
    .collation({ locale: "en" })
    .sort(sortParams)
    // .skip(skip)
    // .limit(limit)
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


// applicant gets applications for a particular job [pagination] [todo: test: done]
router.get("/sys/:id/applications", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to view job applications",
    });
    return;
  }
  const jobId = req.params.id;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  let findParams = {
    jobId: jobId,
    recruiterId: user._id,
  };

  let sortParams = {};

  if (req.query.status) {
    findParams = {
      ...findParams,
      status: req.query.status,
    };
  }

  Application.find(findParams)
    .collation({ locale: "en" })
    .sort(sortParams)
    // .skip(skip)
    // .limit(limit)
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// recruiter/applicant gets all his applications [pagination]
router.get("/applications", jwtAuth, (req, res) => {
  const user = req.user;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  Application.aggregate([
    {
      $lookup: {
        from: "jobapplicantinfos",
        localField: "userId",
        foreignField: "userId",
        as: "jobApplicant",
      },
    },
    { $unwind: "$jobApplicant" },
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    {
      $lookup: {
        from: "jobapplicantinfos",
        localField: "userId",
        foreignField: "userId",
        as: "applicant",
      },
    },
    { $unwind: "$applicant" },
    {
      $match: {
        [user.type === "applicant" ? "userId": "userId"]: user._id,
      },
    },
    {
      $sort: {
        dateOfApplication: -1,
      },
    },
  ])
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// update status of application: [Applicant: Can cancel, Recruiter: Can do everything] [todo: test: done]
router.put("/applications/:id", jwtAuth, (req, res) => {
  const user = req.user;
  const id = req.params.id;
  const status = req.body.status;

  // "applied", // when a applicant is applied
  // "shortlisted", // when a applicant is shortlisted
  // "accepted", // when a applicant is accepted
  // "rejected", // when a applicant is rejected
  // "deleted", // when any job is deleted
  // "cancelled", // an application is cancelled by its author or when other application is accepted
  // "finished", // when job is over

  if (user.type === "recruiter") {
    if (status === "accepted") {
      // get job id from application
      // get job info for maxPositions count
      // count applications that are already accepted
      // compare and if condition is satisfied, then save

      Application.findOne({
        _id: id,
        recruiterId: user._id,
      })
        .then((application) => {
          if (application === null) {
            res.status(404).json({
              message: "Application not found",
            });
            return;
          }

          Job.findOne({
            _id: application.jobId,
            userId: user._id,
          }).then((job) => {
            if (job === null) {
              res.status(404).json({
                message: "Job does not exist",
              });
              return;
            }

            Application.countDocuments({
              recruiterId: user._id,
              jobId: job._id,
              status: "accepted",
            }).then((activeApplicationCount) => {
              if (activeApplicationCount < job.maxPositions) {
                // accepted
                application.status = status;
                application.dateOfJoining = req.body.dateOfJoining;
                application
                  .save()
                  .then(() => {
                    Application.updateMany(
                      {
                        _id: {
                          $ne: application._id,
                        },
                        userId: application.userId,
                        status: {
                          $nin: [
                            "rejected",
                            "deleted",
                            "cancelled",
                            "accepted",
                            "finished",
                          ],
                        },
                      },
                      {
                        $set: {
                          status: "cancelled",
                        },
                      },
                      { multi: true }
                    )
                      .then(() => {
                        if (status === "accepted") {
                          Job.findOneAndUpdate(
                            {
                              _id: job._id,
                              userId: user._id,
                            },
                            {
                              $set: {
                                acceptedCandidates: activeApplicationCount + 1,
                              },
                            }
                          )
                            .then(() => {
                              res.json({
                                message: `Application ${status} successfully`,
                              });
                            })
                            .catch((err) => {
                              res.status(400).json(err);
                            });
                        } else {
                          res.json({
                            message: `Application ${status} successfully`,
                          });
                        }
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                res.status(400).json({
                  message: "All positions for this job are already filled",
                });
              }
            });
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      Application.findOneAndUpdate(
        {
          _id: id,
          recruiterId: user._id,
          status: {
            $nin: ["rejected", "deleted", "cancelled"],
          },
        },
        {
          $set: {
            status: status,
          },
        }
      )
        .then((application) => {
          if (application === null) {
            res.status(400).json({
              message: "Application status cannot be updated",
            });
            return;
          }
          if (status === "finished") {
            res.json({
              message: `Job ${status} successfully`,
            });
          } else {
            res.json({
              message: `Application ${status} successfully`,
            });
          }
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    }
  } else {
    if (status === "cancelled") {
      // console.log(id);
      // console.log(user._id);
      Application.findOneAndUpdate(
        {
          _id: id,
          userId: user._id,
        },
        {
          $set: {
            status: status,
          },
        }
      )
        .then((tmp) => {
          // console.log(tmp);
          res.json({
            message: `Application ${status} successfully`,
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      res.status(401).json({
        message: "You don't have permissions to update job status",
      });
    }
  }
});

// get a list of final applicants for current job : recruiter
// get a list of final applicants for all his jobs : recuiter
router.get("/applicants", jwtAuth, (req, res) => {
  const user = req.user;
  // console.log(user)
  // console.log(req.query.jobId)
  if (user.type === "recruiter") {
    let findParams = {
      recruiterId: user._id,
    };
    if (req.query.jobId) {
      findParams = {
        ...findParams,
        jobId: new mongoose.Types.ObjectId(req.query.jobId),
      };
    }
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        findParams = {
          ...findParams,
          status: { $in: req.query.status },
        };
      } else {
        findParams = {
          ...findParams,
          status: req.query.status,
        };
      }
    }
    let sortParams = {};

    if (!req.query.asc && !req.query.desc) {
      sortParams = { _id: 1 };
    }

    if (req.query.asc) {
      if (Array.isArray(req.query.asc)) {
        req.query.asc.map((key) => {
          sortParams = {
            ...sortParams,
            [key]: 1,
          };
        });
      } else {
        sortParams = {
          ...sortParams,
          [req.query.asc]: 1,
        };
      }
    }

    if (req.query.desc) {
      if (Array.isArray(req.query.desc)) {
        req.query.desc.map((key) => {
          sortParams = {
            ...sortParams,
            [key]: -1,
          };
        });
      } else {
        sortParams = {
          ...sortParams,
          [req.query.desc]: -1,
        };
      }
    }

    Application.aggregate([
      {
        $lookup: {
          from: "jobapplicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "jobApplicant",
        },
      },
      { $unwind: "$jobApplicant" },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      { $match: findParams },
      { $sort: sortParams },
    ])
      .then((applications) => {
        // console.log(applications)
        if (applications.length === 0) {
          res.status(404).json({
            message: "No applicants found",
          });
          return;
        }
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    res.status(400).json({
      message: "You are not allowed to access applicants list",
    });
  }
});

// to add or update a rating [todo: test]
router.put("/rating", jwtAuth, (req, res) => {
  const user = req.user;
  const data = req.body;
  if (user.type === "recruiter") {
    // can rate applicant
    Rating.findOne({
      senderId: user._id,
      receiverId: data.applicantId,
      category: "applicant",
    })
      .then((rating) => {
        if (rating === null) {
          // console.log("new rating");
          Application.countDocuments({
            userId: data.applicantId,
            recruiterId: user._id,
            status: {
              $in: ["accepted", "finished"],
            },
          })
            .then((acceptedApplicant) => {
              if (acceptedApplicant > 0) {
                // add a new rating

                rating = new Rating({
                  category: "applicant",
                  receiverId: data.applicantId,
                  senderId: user._id,
                  rating: data.rating,
                });

                rating
                  .save()
                  .then(() => {
                    // get the average of ratings
                    Rating.aggregate([
                      {
                        $match: {
                          receiverId: mongoose.Types.ObjectId(data.applicantId),
                          category: "applicant",
                        },
                      },
                      {
                        $group: {
                          _id: {},
                          average: { $avg: "$rating" },
                        },
                      },
                    ])
                      .then((result) => {
                        // update the user's rating
                        if (result === null) {
                          res.status(400).json({
                            message: "Error while calculating rating",
                          });
                          return;
                        }
                        const avg = result[0].average;

                        JobApplicant.findOneAndUpdate(
                          {
                            userId: data.applicantId,
                          },
                          {
                            $set: {
                              rating: avg,
                            },
                          }
                        )
                          .then((applicant) => {
                            if (applicant === null) {
                              res.status(400).json({
                                message:
                                  "Error while updating applicant's average rating",
                              });
                              return;
                            }
                            res.json({
                              message: "Rating added successfully",
                            });
                          })
                          .catch((err) => {
                            res.status(400).json(err);
                          });
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                // you cannot rate
                res.status(400).json({
                  message:
                    "Applicant didn't worked under you. Hence you cannot give a rating.",
                });
              }
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        } else {
          rating.rating = data.rating;
          rating
            .save()
            .then(() => {
              // get the average of ratings
              Rating.aggregate([
                {
                  $match: {
                    receiverId: mongoose.Types.ObjectId(data.applicantId),
                    category: "applicant",
                  },
                },
                {
                  $group: {
                    _id: {},
                    average: { $avg: "$rating" },
                  },
                },
              ])
                .then((result) => {
                  // update the user's rating
                  if (result === null) {
                    res.status(400).json({
                      message: "Error while calculating rating",
                    });
                    return;
                  }
                  const avg = result[0].average;
                  JobApplicant.findOneAndUpdate(
                    {
                      userId: data.applicantId,
                    },
                    {
                      $set: {
                        rating: avg,
                      },
                    }
                  )
                    .then((applicant) => {
                      if (applicant === null) {
                        res.status(400).json({
                          message:
                            "Error while updating applicant's average rating",
                        });
                        return;
                      }
                      res.json({
                        message: "Rating updated successfully",
                      });
                    })
                    .catch((err) => {
                      res.status(400).json(err);
                    });
                })
                .catch((err) => {
                  res.status(400).json(err);
                });
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        }
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    // applicant can rate job
    Rating.findOne({
      senderId: user._id,
      receiverId: data.jobId,
      category: "job",
    })
      .then((rating) => {
        // console.log(user._id);
        // console.log(data.jobId);
        // console.log(rating);
        if (rating === null) {
          // console.log(rating);
          Application.countDocuments({
            userId: user._id,
            jobId: data.jobId,
            status: {
              $in: ["accepted", "finished"],
            },
          })
            .then((acceptedApplicant) => {
              if (acceptedApplicant > 0) {
                // add a new rating

                rating = new Rating({
                  category: "job",
                  receiverId: data.jobId,
                  senderId: user._id,
                  rating: data.rating,
                });

                rating
                  .save()
                  .then(() => {
                    // get the average of ratings
                    Rating.aggregate([
                      {
                        $match: {
                          receiverId: mongoose.Types.ObjectId(data.jobId),
                          category: "job",
                        },
                      },
                      {
                        $group: {
                          _id: {},
                          average: { $avg: "$rating" },
                        },
                      },
                    ])
                      .then((result) => {
                        if (result === null) {
                          res.status(400).json({
                            message: "Error while calculating rating",
                          });
                          return;
                        }
                        const avg = result[0].average;
                        Job.findOneAndUpdate(
                          {
                            _id: data.jobId,
                          },
                          {
                            $set: {
                              rating: avg,
                            },
                          }
                        )
                          .then((foundJob) => {
                            if (foundJob === null) {
                              res.status(400).json({
                                message:
                                  "Error while updating job's average rating",
                              });
                              return;
                            }
                            res.json({
                              message: "Rating added successfully",
                            });
                          })
                          .catch((err) => {
                            res.status(400).json(err);
                          });
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                // you cannot rate
                res.status(400).json({
                  message:
                    "You haven't worked for this job. Hence you cannot give a rating.",
                });
              }
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        } else {
          // update the rating
          rating.rating = data.rating;
          rating
            .save()
            .then(() => {
              // get the average of ratings
              Rating.aggregate([
                {
                  $match: {
                    receiverId: mongoose.Types.ObjectId(data.jobId),
                    category: "job",
                  },
                },
                {
                  $group: {
                    _id: {},
                    average: { $avg: "$rating" },
                  },
                },
              ])
                .then((result) => {
                  if (result === null) {
                    res.status(400).json({
                      message: "Error while calculating rating",
                    });
                    return;
                  }
                  const avg = result[0].average;
                  // console.log(avg);

                  Job.findOneAndUpdate(
                    {
                      _id: data.jobId,
                    },
                    {
                      $set: {
                        rating: avg,
                      },
                    }
                  )
                    .then((foundJob) => {
                      if (foundJob === null) {
                        res.status(400).json({
                          message: "Error while updating job's average rating",
                        });
                        return;
                      }
                      res.json({
                        message: "Rating added successfully",
                      });
                    })
                    .catch((err) => {
                      res.status(400).json(err);
                    });
                })
                .catch((err) => {
                  res.status(400).json(err);
                });
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        }
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

// get personal rating
router.get("/rating", jwtAuth, (req, res) => {
  const user = req.user;
  Rating.findOne({
    senderId: user._id,
    receiverId: req.query.id,
    category: user.type === "recruiter" ? "applicant" : "job",
  }).then((rating) => {
    if (rating === null) {
      res.json({
        rating: -1,
      });
      return;
    }
    res.json({
      rating: rating.rating,
    });
  });
});

//change user password
router.post('/changepassword', jwtAuth, async (req, res) => {
  const user = req.user
  const oldpassword = req.body.password
  const hasedpassword = await bcrypt.hash(req.body.newpassword, 10)
  User.findById({ _id: user._id }).then((response) => {
    bcrypt.compare(oldpassword, response.password, (err, result) => {
      if (result) {
        User.findByIdAndUpdate({ _id: user._id }, { password: hasedpassword })
          .then((doc) => res.json({ message: "Password Changed Successful" }))
          .catch((err) => console.log(err))
      } else {
        res.status(400).json({ message: "Please Enter Correct password" })
      }
    })
  })
})

// get all applicatnts information without middleware
router.get('/allapplicants', (req, res) => {
  JobApplicant.find({})
    .then((data) => res.json(data))
    .catch((err) => console.log(err))
})

router.post('/allapplicants/search',(req, res) => {
  let user = req.user;
  console.log(req.body, 'search')
  let findParams = {};
  let sortParams = {};
  var limit = 20;
  var offset = 0;
  let page=1;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.page !== 'undefined') {
    page = req.query.page;
    offset = limit * page
  }
  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  console.log(req.query.q)
  if (user && user.type === "recruiter" && req.query.myjobs) {
    console.log('aaa');
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.body.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.body.q, "i"),
      },
    };
  }

  if (req.body.qlocation) {

    findParams = {
      ...findParams,
      cities: {
        $regex: new RegExp(req.body.qlocation, "i"),
      },
    };
  }

  var optRegexp = [];
  for (const location of req.body.location) {
    optRegexp.push(new RegExp(location, "i"));
  }

  if (req.body.location && req.body.location.length !== 0) {
    findParams = {
      ...findParams,
      currentlocation: { "$in": optRegexp },
    };
  }


  if (req.body.applicationFilter) {
    if (req.body.applicationFilter === "resume") {
      findParams = {
        ...findParams,
        'resume.url': { $ne: "" }
      };
    }
    else {
      findParams = {
        ...findParams,
        'resume.url': { $eq: "" }
      };
    }

  }

  if (req.body.experience) {
    if (req.body.experience == "0-2 Years") {
      findParams = {
        ...findParams,
        $or: [
          {
            total_experience: { $eq: req.body.experience }
          },
          {
            experience: { $eq: "fresher" }
          },
        ],

      };
    } else {
      findParams = {
        ...findParams,
        total_experience: { $eq: req.body.experience }
      };
    }
  }
  if (req.body.state && req.body.state.length !== 0) {
    findParams = {
      ...findParams,
      state: { "$in": req.body.state }
    };
  }

  if (req.body.industryType && req.body.industryType.length !== 0) {
    findParams = {
      ...findParams,
      industryType: { "$in": req.body.industryType }
    };
  }

  var categoryRegexp = [];
  if (req.body.category && req.body.category.length !== 0) {
    for (const category of req.body.category) {
      categoryRegexp.push(new RegExp(category, "i"));
    }
  }

  if (categoryRegexp && categoryRegexp.length !== 0) {
    findParams = {
      ...findParams,
      'employment.designation': { "$in": categoryRegexp },
    };
  }

  if (req.body.companies && req.body.companies.length !== 0) {
    findParams = {
      ...findParams,
      userId: { "$in": req.body.companies }
    };
  }

  var optEducationRegexp = [];
  if (req.body.educations && req.body.educations.length !== 0) {
    for (const educations of req.body.educations) {
      optEducationRegexp.push(new RegExp(educations, "i"));
    }
  }

  if (optEducationRegexp && optEducationRegexp.length !== 0) {
    findParams = {
      ...findParams,
      'education.highestgraduation': { "$in": optEducationRegexp },
    };
  }


  // var optEducationRegexp = [];
  // for (const educations_course of req.body.educations_course) {
  //   optEducationRegexp.push(new RegExp(educations_course, "i"));
  // }

  if (req.body.educations_course && req.body.educations_course.length !== 0) {
    findParams = {
      ...findParams,
      'education.course': { "$in": req.body.educations_course },
    };
  }

  var skillsRegexp = [];
  if (req.body.skills && req.body.skills.length !== 0) {
    for (const skill of req.body.skills) {
      skillsRegexp.push(new RegExp(skill, "i"));
    }
  }

  if (skillsRegexp && skillsRegexp.length !== 0) {
    findParams = {
      ...findParams,
      skills: { "$in": skillsRegexp },
    };
  }
  if (req.body.timestamp && req.body.timestamp.length !== 0) {
    let date = req.body.timestamp
    findParams = {
      ...findParams,
      jobApplicantDate: { $gte: new Date(new Date() - Number(date) * 60 * 60 * 24 * 1000) },
    };
  }

  if (req.query.jobType) {
    let jobTypes = [];
    if (Array.isArray(req.query.jobType)) {
      jobTypes = req.query.jobType;
    } else {
      jobTypes = [req.query.jobType];
    }
    // console.log(jobTypes);
    findParams = {
      ...findParams,
      jobType: {
        $in: jobTypes,
      },
    };
  }


  if (req.body.ageMin && req.body.ageMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          'personaldetails.age': {
            $gte: parseInt(req.body.ageMin),
          },
        },
        {
          'personaldetails.age': {
            $lte: parseInt(req.body.ageMax),
          },
        },
      ],
    }
  } else if (req.body.ageMin) {
    findParams = {
      ...findParams,
      'personaldetails.age': {
        $gte: parseInt(req.body.ageMin),
      },
    };
  } else if (req.body.ageMax) {
    findParams = {
      ...findParams,
      'personaldetails.age': {
        $lte: parseInt(req.body.ageMax),
      },
    };
  }

  if (req.body.expectedCTC) {
    findParams = {
      ...findParams,
      'careerprofile.Desired_Expected_SalaryinLakhs': { $eq: req.body.expectedCTC }
    };
  }

  if (req.body.salaryMin && req.body.salaryMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          salary: {
            $gte: parseInt(req.body.salaryMin),
          },
        },
        {
          salary: {
            $lte: parseInt(req.body.salaryMax),
          },
        },
      ],
    };
  } else if (req.body.salaryMin) {
    findParams = {
      ...findParams,
      salary: {
        $gte: parseInt(req.body.salaryMin),
      },
    };
  } else if (req.body.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        $lte: parseInt(req.body.salaryMax),
      },
    };
  }
  //gender search
  if (req.body.gender && req.body.gender.length != 0) {
    findParams = {
      ...findParams,
      'personaldetails.gender': { "$in": req.body.gender },
    };
  }
  if (req.body.isPhoneVerified) {
    findParams = {
      ...findParams,
      isPhoneVerified: { $eq: true }
    }
  }

  if (req.body.isEmailVerified) {
    findParams = {
      ...findParams,
      isEmailVerified: { $eq: true }
    }
  }

  if (req.body.isResume) {
    findParams = {
      ...findParams,
      'resume.url': { $ne: "" }
    };
  }
  if (req.body.job_type && req.body.job_type.length != 0) {
    findParams = {
      ...findParams,
      'careerprofile.Desired_Job_Type': { "$in": req.body.job_type },
    };
  }

  if (req.body.emp_type && req.body.emp_type.length != 0) {
    findParams = {
      ...findParams,
      'careerprofile.Desired_Employement_Type': { "$in": req.body.emp_type },
    };
  }

  if (req.body.work_shift && req.body.work_shift.length != 0) {
    findParams = {
      ...findParams,
      'careerprofile.Desired_PrefferedShift': { "$in": req.body.work_shift },
    };
    console.log(findParams)
  }

  //profilefreshness
  if (req.body.profileSearch && req.body.profileSearch.length != 0) {
    let date = new Date(req.body.profileSearch[0].endDate);
    date.setDate(date.getDate() + 1);
    findParams = {
      ...findParams,
      jobApplicantDate: {
        $gte: new Date(req.body.profileSearch[0].startDate).toISOString(),
        $lte: new Date(date).toISOString()
      }
    }
  };
  // var salaryArr = []
  // for (const salary of req.body.salaries) {
  //   // optEducationRegexp.push(  new RegExp(educations, "i") );
  //   salaryArr.push({
  //     $and: [
  //       {
  //         salary: {
  //           $gte: parseInt(salary.salaryMin),
  //         },
  //       },
  //       {
  //         salary: {
  //           $lte: parseInt(salary.salaryMax),
  //         },
  //       },
  //     ],
  //   })
  // }


  // if (req.body.salaries && req.body.salaries.length !== 0) {
  //   console.log('salaryArr',salaryArr[0].$and);
  //   findParams = {
  //     ...findParams,
  //     salary: salaryArr
  //   };
  // }

  // if (req.query.duration) {
  //   findParams = {
  //     ...findParams,
  //     duration: {
  //       $lt: parseInt(req.query.duration),
  //     },
  //   };
  // }

  // if (req.query.asc) {
  //   if (Array.isArray(req.query.asc)) {
  //     req.query.asc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: 1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.asc]: 1,
  //     };
  //   }
  // }

  // if (req.query.desc) {
  //   if (Array.isArray(req.query.desc)) {
  //     req.query.desc.map((key) => {
  //       sortParams = {
  //         ...sortParams,
  //         [key]: -1,
  //       };
  //     });
  //   } else {
  //     sortParams = {
  //       ...sortParams,
  //       [req.query.desc]: -1,
  //     };
  //   }
  // }

  // console.log(findParams);
  // console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  // let arr = [
  //   {
  //     $lookup: {
  //       from: "recruiterinfos",
  //       localField: "userId",
  //       foreignField: "userId",
  //       as: "recruiter",
  //     },
  //   },
  //   { $unwind: "$recruiter" },
  //   { $match: findParams },
  // ];

  // if (Object.keys(sortParams).length > 0) {
  //   arr = [
  //     {
  //       $lookup: {
  //         from: "recruiterinfos",
  //         localField: "userId",
  //         foreignField: "userId",
  //         as: "recruiter",
  //       },
  //     },
  //     { $unwind: "$recruiter" },
  //     { $match: findParams },
  //     {
  //       $sort: sortParams,
  //     },
  //   ];
  // }

  // console.log(findParams, 'findparams');

  JobApplicant.find(findParams)
    .sort({ jobApplicantDate: -1, name: 1 })
    .collation({ locale: "en", caseLevel: true })
    .then(async (posts) => {
      let counts = await JobApplicant.count(findParams).exec()
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      // if (req.body.salaries && req.body.salaries.length !== 0) {
      //   posts = posts.filter(post => {
      //     let flag = false
      //     for (const salary of req.body.salaries) {
      //       if (salary.salaryMin <= post.salary && salary.salaryMax >= post.salary) {
      //         flag = true
      //       }
      //     }
      //     return flag;
      //   })
      // }


      // posts = await Promise.all(
      //   posts.map(async post => {
      //     post.recruiter = await Recruiter.findOne({ userId: post.userId });
      //     let result = await WishList.findOne({ userId: req.user._id, jobId: post._id })
      //     console.log('result ', post.userId);
      //     post.wishlist = result ? true : false
      //     return post;
      //   })
      // )

      res.json({ posts, listOfStudents: posts.length, counts });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
})

router.get("/jobs", jwtAuth, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("PostedBy", "_id name")
    .then(mypost => {
      console.log(mypost)
    })
    .catch(err => {
      console.log(err)
    })
})

router.get("/sys", jwtAuth, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("PostedBy", "_id name")
    .then(mypost => {
      console.log(mypost)
    })
    .catch(err => {
      console.log(err)
    })
})


// router.post("/resume/upload", jwtAuth, async (req, res, next) => {
//   singleUpload(req, res, async (err) => {
//     let user = req.user;
//     if (err) {
//       console.log(err);
//       return res.status(422).send({
//         errors: [{ title: "File Upload Error", detail: err.message }],
//       });
//     }
//     if (user.type != "applicant") {
//       res.status(401).json({
//         message: "You don't have permissions to upload resume",
//       });
//       return;
//     }
//     let jobApplicant = await JobApplicant.findOne({ userId: user._id })
//     console.log('jjj ', jobApplicant);
//     jobApplicant.resume.url = req.file.location;
//     jobApplicant.save().then(() => {
//       return res.json({ imageUrl: req.file.location });
//     })

//   });
// });

// router.post("/profile/upload", jwtAuth, async (req, res, next) => {
//   singleUpload(req, res, async (err) => {
//     let user = req.user;
//     if (err) {
//       console.log(err);
//       return res.status(422).send({
//         errors: [{ title: "File Upload Error", detail: err.message }],
//       });
//     }
//     if (user.type == "applicant") {
//       let jobApplicant = await JobApplicant.findOne({ userId: user._id })
//       console.log('jjj ', jobApplicant);
//       jobApplicant.profileImage = req.file.location;
//       jobApplicant.save().then(() => {
//         return res.json({ imageUrl: req.file.location });
//       })
//     } else {
//       let recruiter = await Recruiter.findOne({ userId: user._id })
//       console.log('rrrr ', recruiter);
//       recruiter.profileImage = req.file.location;
//       recruiter.save().then(() => {
//         return res.json({ imageUrl: req.file.location });
//       })
//     }
//   });
// });

router.get("/wishlist/add/:jobId", jwtAuth, async (req, res) => {
  let { jobId } = req.params;
  let wishlist = await WishList.findOne({ userId: req.user._id, jobId })
  if (wishlist) {
    return res.status(400).json({ message: 'Already added' })
  }
  WishList.create({
    userId: req.user._id,
    jobId
  }).then(() => {
    return res.json({ message: 'Added!' })
  })
})

router.get("/wishlist/remove/:jobId", jwtAuth, async (req, res) => {
  let { jobId } = req.params;
  let wishlist = await WishList.findOne({ userId: req.user._id, jobId })
  if (!wishlist) {
    return res.status(400).json({ message: 'Not added to remove' })
  }
  WishList.remove({
    userId: req.user._id,
    jobId
  }).then(() => {
    return res.json({ message: 'Added!' })
  })
})

router.get("/wishlist/list", jwtAuth, async (req, res) => {
  // let { jobId } = req.params;
  let wishlist = await WishList.find({ userId: req.user._id, }).populate('jobId').lean();

  wishlist = await Promise.all(
    wishlist.map(async job => {
      // job.jobId
      job.recruiter = await Recruiter.findOne({
        userId: job.jobId.userId
      })
      return job;
    })
  )

  return res.json({ data: wishlist });
})


router.get("/job-alerts/list", jwtAuth, async (req, res) => {
  // let { jobId } = req.params;
  let jobAlerts = await JobAlerts.find({ userId: req.user._id, }).populate('jobId').lean();

  jobAlerts = await Promise.all(
    jobAlerts.map(async job => {
      // job.jobId
      job.recruiter = await Recruiter.findOne({
        userId: job.jobId.userId
      })
      return job;
    })
  )



  return res.json({ data: jobAlerts });
})


router.get("/job-alerts/:jobId", jwtAuth, async (req, res) => {
  let { jobId } = req.params;
  let user = req.user;

  await JobAlerts.updateOne({ jobId, userId: user._id }, { isReaded: true }).then((d) => {
    console.log('yeessss', d);
  })

  return res.json({});
})



router.get("/notification", jwtAuth, async (req, res) => {
  // let { jobId } = req.params;
  let jobAlerts = await JobAlerts.count({ userId: req.user._id, isReaded: false });
  let appliedJobs = await Application.count({ userId: req.user._id });




  return res.json({ jobAlerts, appliedJobs });
})
router.post("/role/list/filter", async (req, res) => {

  let findParams = {};
  let sortParams = {};
  var limit = 20;
  var offset = 0;


  if (req.body.role && req.body.role.length !== 0) {
    findParams = {
      ...findParams,
      title: { "$in": req.body.role }
    };
  }
  Job.find(findParams)
    .limit(Number(limit))
    .skip(Number(offset))
    .lean()
    .then(async (posts) => {

      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }

      res.json({ posts });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
router.post("/jobapplicants/list/Bydates", async (req, res) => {
  let date = new Date(req.body.endDate);
  date.setDate(date.getDate() + 1);
  JobApplicant.find({
    jobApplicantDate: {
      $gte: new Date(req.body.startDate).toISOString(),
      $lte: new Date(date).toISOString()
    }
  })
    .then(async (posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      res.json({
        status: 200,
        message: "success",
        posts: posts,
        count: posts.length
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
})
router.post('/plans', async (req, res) => {
  // const {SubscriptionType,SubscriptionId,SubscriptionTitle,subscriptionPackMonths,subscriptionPackPrice}=req.body;
  const data = req.body;
  let Plans = new subscription({
    SubscriptionType: data.SubscriptionType,
    SubscriptionId: data.SubscriptionId,
    SubscriptionTitle: data.SubscriptionTitle,
    subscriptionPack: data.subscriptionPack,
    MonthlyLimit: data.MonthlyLimit,
    DailyLimit: data.DailyLimit

  });
  await Plans.save().then(() => {
    res.json({
      status: 200
    })
  }).catch((e) => {
    res.json({
      statu: 400,
      error: e
    })

  })
});

router.post('/subscription/plans', jwtAuth, async (req, res) => {
  const user = req.user;
  // console.log(user, 'userrr')
  let data = req.body;

  /* let user_id=user._id; */

  let subscriptionData = await subscription.find({ SubscriptionId: data.subscriptionDetails[0].isSubscriptionPlan });
  let date = new Date();
  let mul = subscriptionData[0].subscriptionPack[0].subscriptionPackMonths;
  let expDate = date.setDate(date.getDate() + 30 * Number(mul));
  let expdatee = new Date(expDate).toISOString();
  let daily = subscriptionData[0].DailyLimit[0]
  let month = subscriptionData[0].MonthlyLimit[0]
  let h1 = {
    isMonthlySmsCount: (month.isMonthlySmsCount) * (data.subscriptionDetails[0].isSubscriptionPlan),
    isMonthlyProfileView: (month.isMonthlyProfileView) * (data.subscriptionDetails[0].isSubscriptionPlan),
    isMonthlyExcelDownloadCount: (month.isMonthlyExcelDownloadCount) * (data.subscriptionDetails[0].isSubscriptionPlan)
  };

  data.subscriptionDetails[0].isSubscriptionExpiryDate = expdatee,
    data.subscriptionDetails[0].MonthlyLimit = month
  data.subscriptionDetails[0].DailyLimit = daily;
  data.subscriptionDetails[0].remainingMonthlyLimit = h1;


  let update = {
    subscription: subscriptionData[0].SubscriptionType,
    subscriptionDetails: data.subscriptionDetails,
  };


  await Recruiter.updateMany({ companyname: data.companyName }, update).
    then(() => {
      res.json({
        status: 200,

      })
    }).catch((e) => {
      console.log(e)
      res.json({
        statu: 400,
        error: e
      })

    })
})

router.post('/update/count/plans', async (req, res) => {
  let recuiterData = await Recruiter.find({ companyname: req.body.companyName })
  let subscriptionDetails = recuiterData[0].subscriptionDetails[0];
  let hrData = await Recruiter.findOne({ companyname: req.body.companyName }, { hrData: { $elemMatch: { employeeId: req.body.employeeId } } });
  //daily limit check
  let checkdownlods = Number(subscriptionDetails.isDailyExcelDownloadCount) + Number(req.body.isDailyExcelDownloadCount);
  //monthly
  let checkMonthkydownlods = Number(subscriptionDetails.isDailyExcelDownloadCount)

  let datee = Date.now()
  let date = new Date(datee).toISOString();
  let d = JSON.stringify(subscriptionDetails.isSubscriptionExpiryDate);
  let originalsmscount = subscriptionDetails.remainingMonthlyLimit[0].isMonthlySmsCount;
  let originalProfileView = subscriptionDetails.remainingMonthlyLimit[0].isMonthlyProfileView;
  let originalExcelDownloadCount = subscriptionDetails.remainingMonthlyLimit[0].isMonthlyExcelDownloadCount;

  if (d.slice(1, 11) == date.slice(0, 10)) {
    res.json({
      message: "Your plan is expired.Please buy new plan."
    })
    return;
  }
  if (recuiterData[0].hrData.length == 0) {
    res.json({
      message: "Hr Data not found..."
    })
    return;
  }
  else if (Number(subscriptionDetails.isDailySmsCount) >= Number(subscriptionDetails.DailyLimit[0].isDailySmsCount) && Number(req.body.isDailySmsCount) > 0) {
    res.json({
      message: "You are reached maximum sms limite for today please try tommorow."
    })
    return;
  }
  else if (Number(subscriptionDetails.isDailyProfileView) >= Number(subscriptionDetails.DailyLimit[0].isDailyProfileView) && req.body.isDailyProfileView > 0) {
    res.json({
      message: "You are reached maximum ProfileView limite for today please try tommorow."
    })
    return;
  }
  else if (checkdownlods > Number(subscriptionDetails.DailyLimit[0].isDailyExcelDownloadCount) && req.body.isDailyExcelDownloadCount > 0) {
    res.json({
      message: "You are reached maximum ExcelDownload limite for today please try tommorow."
    })
    return;
  }
  //mothly
  else if (Number(subscriptionDetails.isMonthlySmsCount) >= Number(subscriptionDetails.MonthlyLimit[0].isMonthlySmsCount)) {
    res.json({
      message: "You are reached maximum sms limite for This Month please try after some time"
    })
    return;
  }
  else if (Number(subscriptionDetails.isMonthlyProfileView) >= Number(subscriptionDetails.MonthlyLimit[0].isMonthlyProfileView)) {
    res.json({
      message: "You are reached maximum ProfileView limite for This Month please try after some time."
    })
    return;
  }
  else if (checkMonthkydownlods > Number(subscriptionDetails.MonthlyLimit[0].isMonthlyExcelDownloadCount)) {
    res.json({
      message: "You are reached maximum ExcelDownload limite for This Month please try after some time."
    })
    return;
  }
  else {
    let companyCount = {
      "subscriptionDetails.$[].isDailySmsCount": Number(subscriptionDetails.isDailySmsCount) + Number(req.body.isDailySmsCount),
      "subscriptionDetails.$[].isDailyProfileView": Number(subscriptionDetails.isDailyProfileView) + Number(req.body.isDailyProfileView),
      "subscriptionDetails.$[].isDailyExcelDownloadCount": Number(subscriptionDetails.isDailyExcelDownloadCount) + Number(req.body.isDailyExcelDownloadCount),
      "subscriptionDetails.$[].isMonthlySmsCount": Number(subscriptionDetails.isMonthlySmsCount) + Number(req.body.isDailySmsCount),
      "subscriptionDetails.$[].isMonthlyProfileView": Number(subscriptionDetails.isMonthlyProfileView) + Number(req.body.isDailyProfileView),
      "subscriptionDetails.$[].isMonthlyExcelDownloadCount": Number(subscriptionDetails.isMonthlyExcelDownloadCount) + Number(req.body.isDailyExcelDownloadCount),
      "subscriptionDetails.$[].remainingMonthlyLimit.$[].isMonthlySmsCount": Number(originalsmscount) - Number(req.body.isDailySmsCount),
      "subscriptionDetails.$[].remainingMonthlyLimit.$[].isMonthlyProfileView": Number(originalProfileView) - Number(req.body.isDailyProfileView),
      "subscriptionDetails.$[].remainingMonthlyLimit.$[].isMonthlyExcelDownloadCount": Number(originalExcelDownloadCount) - Number(req.body.isDailyExcelDownloadCount)
    };
    let recruiterCount = {
      "hrData.$.userDailySmsCount": Number(hrData.hrData[0].userDailySmsCount) + Number(req.body.isDailySmsCount),
      "hrData.$.userDailyProfileView": Number(hrData.hrData[0].userDailyProfileView) + Number(req.body.isDailyProfileView),
      "hrData.$.userDailyExcelDownloadCount": Number(hrData.hrData[0].userDailyExcelDownloadCount) + Number(req.body.isDailyExcelDownloadCount),
      "hrData.$.userMonthlySmsCount": Number(hrData.hrData[0].userMonthlySmsCount) + Number(req.body.isDailySmsCount),
      "hrData.$.userMonthlyProfileView": Number(hrData.hrData[0].userMonthlyProfileView) + Number(req.body.isDailyProfileView),
      "hrData.$.userMonthlyExcelDownloadCount": Number(hrData.hrData[0].userMonthlyExcelDownloadCount) + Number(req.body.isDailyExcelDownloadCount)
    };
    await Recruiter.updateMany({ companyname: req.body.companyName }, companyCount)
    await Recruiter.findOneAndUpdate({ "hrData": { "$elemMatch": { "employeeId": req.body.employeeId } } }, { "$set": recruiterCount }).
      then((data) => {
        res.json({
          status: 200,
        })
      }).catch((e) => {
        console.log(e)
        res.json({
          statu: 400,
          error: e
        })
      })
  }
});

router.post('/add/user_hr', async (req, res) => {
  let data = req.body;
  const salt = await bcrypt.genSalt(10);

  let listOfHrs = await Recruiter.find({ companyname: data.companyName });

  if (listOfHrs[0].hrData.length == 0) {
    pwd = await bcrypt.hash(data.password, salt);
    let update = {
      "name": data.name,
      "dateOfJoining": data.dateOfJoining,
      "hrPosition": data.hrPosition,
      "employeeId": data.employeeId,
      "password": pwd,
      "admin": true
    };
    await Recruiter.findOneAndUpdate({ companyname: data.companyName }, { "$push": { hrData: update } }).
      then(() => {
        res.json({
          status: 200,
        })
      }).catch((e) => {
        console.log(e)
        res.json({
          statu: 400,
          error: e
        })
      })
  }
  else if (listOfHrs[0].hrData.length != 3 && data.isadmin) {
    pwd = await bcrypt.hash(data.password, salt);
    let update = {
      "name": data.name,
      "dateOfJoining": data.dateOfJoining,
      "hrPosition": data.hrPosition,
      "employeeId": data.employeeId,
      "password": pwd
    };
    await Recruiter.findOneAndUpdate({ companyname: data.companyName }, { "$push": { hrData: update } }).
      then(() => {
        res.json({
          status: 200,

        })
      }).catch((e) => {
        console.log(e)
        res.json({
          statu: 400,
          error: e
        })

      })
  } else if (listOfHrs[0].hrData.length == 3) {
    res.json({
      status: 400,
      message: "You can't add more then 3 HR's"
    })
  } else {
    res.json({
      status: 400,
      message: "You don't have access to add HR's"
    })
  }
})

router.post('/hr/login', async (req, res) => {
  let data = req.body;
  let hrData = await Recruiter.findOne({ companyname: data.companyName }, { hrData: { $elemMatch: { employeeId: data.employeeId } } });
  if (hrData.hrData.length != 0) {
    bcrypt.compare(data.password, hrData.hrData[0].password, (err, result) => {
      if (hrData.hrData[0].employeeId == data.employeeId && result == true) {
        res.json({
          msg: "login successful!",
          HRData: hrData.hrData,
        });
      } else {
        res.json({
          mag: "Invalid credentials!",
        });
      }
    });
  } else {
    res.json({
      mag: "Invalid credentials!",
    });
  }

});

router.post('/get/dashboard/data', async (req, res) => {
  let data = req.body;
  await Recruiter.findOne({ companyname: data.companyName })
    .then((data) => {
      res.json({
        msg: "success",
        data: data

      });
    }).catch((e) => {
      console.log(e)
      res.json({
        mag: "Invalid"

      })
    })
})

router.post('/get/dashboard/hr/data', async (req, res) => {
  let data = req.body;
  await Recruiter.findOne({ companyname: req.body.companyName }, { hrData: { $elemMatch: { employeeId: req.body.employeeId } } })
    .then((data) => {
      res.json({
        msg: "success",
        data: data.hrData

      });
    }).catch((e) => {
      console.log(e)
      res.json({
        mag: "Invalid"

      })
    })
})


module.exports = router;
