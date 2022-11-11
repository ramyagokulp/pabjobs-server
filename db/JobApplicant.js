const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: mongoose.SchemaTypes.Email,
      unique: true,
      lowercase: true,
      required: true,
    },
    profileImage: {
      type: String,
    },
    experience: {
      type: Object,
      default: "",
    },

    lastname: {
      type: Object,
      default: "",
    },
    qualification: {
      type: Object,
      default: "",
    },
    yop: {
      type: Object,
      default: "",
    },

    locality: {
      type: Object,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },
    // single:{
    //   type:String,
    //   default:"",
    // },
    percentage:{
      type:String,
      default:"",
    },
    collegename:{
      type:String,
      default:"",
    },
    total_experience:{
      type: String,
      default: "",
    },
    currentlocation: [],
    resumeHeadline: {
      type: String,
      default: "",
    },
    profileSummary: {
      type: String,
      default: "",
    },
    skills: [],
    employment: [
      {
        years: {
          type: String,
          default: "",
        },
        isCurrentCompany:{
          type: String,
          default:""
        },
        noticePeriod:{
          type: String,
          default:""
        },
        months: {
          type: String,
          default: "",
        },
        designation: [],
        organization: [],
        startYear: {
          type: Date,
          default: Date.now(),
        },
        endYear: {
          type: Date,
          default: Date.now(),
        },
        profileDescription: {
          type: String,
          default: "",
        },
        noticePeriod: {
          type: String,
          default: "",
        },
        offerLetter: {
          type: String,
          default: "",
        },
        expLetter: {
          type: String,
          default: "",
        },
        salaryslip: {
          type: String,
          default: "",
        },
        BankStatement: {
          type: String,
          default: "",
        },
        offerLetterName: {
          type: String,
          default: "",
        },
        expLetterName: {
          type: String,
          default: "",
        },
        salaryslipName: {
          type: String,
          default: "",
        },
        BankStatementName: {
          type: String,
          default: "",
        },
        CurrentCTC: {
          type: String,
          default: "",
        }
      },
    ],
    education: [
      {
        highestgraduation: {
          type: String,
          default: "",
        },
        course: {
          type: String,
          default: "",
        },
        specialization: {
          type: String,
          default: "",
        },
        institute: {
          type: String,
          default: "",
        },
        passedoutyear: {
          type: Number,
          default: "",
        },
        courseType: {
          type: String,
          default: "",
        },
        marks: {
          type: Number,
          default: "",
        },
      },
    ],
    project: [
      {
        ProjectTitle: {
          type: String,
          default: "",
        },
        ProjectClient: {
          type: String,
          default: "",
        },
        ProjectDescription: {
          type: String,
          default: "",
        },
        ProjectStartDate: {
          type: Date,
          default: "",
        },
        ProjectWorkTill: {
          type: Date,
          default: "",
        },
      },
    ],
    worksample: [
      {
        Work_Title: {
          type: String,
          default: "",
        },
        Work_URL: {
          type: String,
          default: "",
        },
        Work_Duration_From: {
          type: Date,
          default: "",
        },
        Work_Duration_To: {
          type: Date,
          default: "",
        },
        Work_Description: {
          type: String,
          default: "",
        },
      },
    ],
    presentation: [
      {
        Presentation_Title: {
          type: String,
          default: "",
        },
        Presentation_URL: {
          type: String,
          default: "",
        },
        Presentation_Description: {
          type: String,
          default: "",
        },
      },
    ],
    publication: [
      {
        Publication_Title: {
          type: String,
          default: "",
        },
        Publication_URL: {
          type: String,
          default: "",
        },
        Publication_Year: {
          type: String,
          default: "",
        },
        Publication_Months: {
          type: String,
          default: "",
        },
        Publication_Description: {
          type: String,
          default: "",
        },
      },
    ],
    patent: [
      {
        Patent_Title: {
          type: String,
          default: "",
        },
        Patent_URL: {
          type: String,
          default: "",
        },
        Patent_Office: {
          type: String,
          default: "",
        },
        Patent_Status: {
          type: String,
          default: "",
        },
        Patent_Application_Number: {
          type: String,
          default: "",
        },
        Patent_Description: {
          type: String,
          default: "",
        },
      },
    ],
    certification: [
      {
        Certification_Name: {
          type: String,
          default: "",
        },
        Certification_ID: {
          type: String,
          default: "",
        },
        Certification_URL: {
          type: String,
          default: "",
        },
        Certification_Validity_From: {
          type: Date,
          default: "",
        },
        Certification_Validity_To: {
          type: Date,
          default: "",
        },
      },
    ],
    careerprofile: [
      {
        career_Industry: {
          type: String,
          default: "",
        },
        Desired_Functional_Area_Department: {
          type: String,
          default: "",
        },
        Desired_Role_URL: {
          type: String,
          default: "",
        },
        Desired_Job_Type: {
          type: String,
          default: "",
        },
        Desired_Employement_Type: {
          type: String,
          default: "",
        },
        Desired_PrefferedShift: {
          type: String,
          default: "",
        },
        Desired_AvailableJoinYears: {
          type: String,
          default: "",
        },
        Desired_AvailableJoinMonths: {
          type: String,
          default: "",
        },
        Desired_Expected_SalaryinLakhs: {
          type: String,
          default: "",
        },
        Desired_Expected_SalaryinThousands: {
          type: String,
          default: "",
        },
        Desired_Location: {
          type: String,
          default: "",
        },
        Desired_Industry: {
          type: String,
          default: "",
        },
      },
    ],
    rating: {
      type: Number,
      max: 5.0,
      default: -1.0,
      validate: {
        validator: function (v) {
          return v >= -1.0 && v <= 5.0;
        },
        msg: "Invalid rating",
      },
    },
    // resume: {
    //   type: String,
    //   default:""
    // },
    resume: {
      filename: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
    profile: {
      type: String,
      default: "",
    },
    personaldetails: {
      dateofbirth: {
        type: Date,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      gender: {
        type: String,
        default: "",
      },
      pincode: {
        type: Number,
        default: "",
      },
      maritalStatus: {
        type: String,
        default: "",
      },
      hometown: {
        type: String,
        default: "",
      },
      AddressProof: {
        type:String,
        default:"",
      },
      AdressProofNumber: {
        type:String,
        default:""
      },
      passport : {
        type:String,
        default:""
      },
      margaccount : {
        type:String,
        default:""
      },
      age:{
        type:Number,
        default:""
      },
      languages: [
        {
          type: String,
          default: "",
        },
      ],
    },
    contactNumber: {
      type: Number,
      // validate: {
      //   validator: function (v) {
      //     // var v = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      //     return v !== "" ? /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(v) : true;
      //   },
      //   msg: "Phone number is invalid!",
      // },
    },
    isPhoneVerified: { type: Boolean,default:false },
    contactOtp:{type:Number},
    emailOtp:{type:Number},
    isEmailVerified : {type:Boolean,default:false},
     jobApplicantDate: {
      type: Date,
      default: Date.now()
    },
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("JobApplicantInfo", schema);