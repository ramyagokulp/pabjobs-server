const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    profileImage: {
      type: String
    },
    companyname: {
      type: String,
      required: true,
    },
    hrname: {
      type: String,
      // required: true,
    },
    websitelink: {
      type: String,
      default: ""
    },

    foundedDate: {
      type: Date,
      default: ""
    },
    organizationType: {
      type: String,
      default: ""
    },
    country: {
      type: String,
      default: ""
    },
    contactNumber: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      required: true
    },
    state: {
      type: String,
      default: ""
    },
    // myfile: {
    //   type: file,
    //   default: ""
    // },
    city: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    pincode: {
      type: Number,
      default: ""
    },
    facebook: {
      type: String,
      default: ""
    },
    twitter: {
      type: String,
      default: ""
    },
    google: {
      type: String,
      default: ""
    },
    jobDescription:{
      filename: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
    linkedin:{
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    subscription: {
      type: String,
      default: ""
    },
    subscriptionDetails: [
      {
        isSubscriptionPlan: {
          type: String,
          default: "",
        },
        isSubscriptionDate: {
          type: Date,
          default: Date.now()
        },
        MonthlyLimit: [],
        DailyLimit: [],
        remainingMonthlyLimit: [],
        isSubscriptionExpiryDate: {
          type: Date,
          default: Date.now()
        },
        isDailySmsCount: {
          type: String,
          default: 0
        },
        isDailyProfileView: {
          type: String,
          default: 0
        },
        isDailyExcelDownloadCount: {
          type: String,
          default: 0
        },
        isMonthlySmsCount: {
          type: String,
          default: 0
        },
        isMonthlyProfileView: {
          type: String,
          default: 0
        },
        isMonthlyExcelDownloadCount: {
          type: String,
          default: 0
        }
      }
    ],
    hrData: [
      {
        name: {
          type: String,
          default: ""
        },
        dateOfJoining: {
          type: Date,
          default: ""
        },
        hrPosition: {
          type: String,
          default: ""
        },
        employeeId: {
          type: String,
          default: ""
        },
        password: {
          type: String,
          default: ""
        },
        admin: {
          type: Boolean,
          default: false
        },
        userDailySmsCount: {
          type: String,
          default: 0
        },
        userDailyProfileView: {
          type: String,
          default: 0
        },
        userDailyExcelDownloadCount: {
          type: String,
          default: 0
        },
        userMonthlySmsCount: {
          type: String,
          default: 0
        },
        userMonthlyProfileView: {
          type: String,
          default: 0
        },
        userMonthlyExcelDownloadCount: {
          type: String,
          default: 0
        }
      }
    ]
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("RecruiterInfo", schema);