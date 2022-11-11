const mongoose = require("mongoose");

let schema = new mongoose.Schema(
 {
  SubscriptionType: {
   type: String,
   default: "",
  },
  SubscriptionId: {
   type: String,
  },
  SubscriptionTitle: {
   type: String,
   required: true,
  },
  subscriptionPack: [
   {
    subscriptionPackMonths: {
     type: String,
    },
    subscriptionPackPrice: {
     type: String,
    }
   },
  ],
  MonthlyLimit: [
   {
    isMonthlySmsCount: {
     type: String,
     default: 2000,
    },
    isMonthlyProfileView: {
     type: String,
     default: 1000,
    },
    isMonthlyExcelDownloadCount: {
     type: String,
     default: 100,
    },
   },
  ],
  DailyLimit: [
   {
    isDailySmsCount: {
     type: String,
     default: 250,
    },
    isDailyProfileView: {
     type: String,
     default: 150,
    },
    isDailyExcelDownloadCount: {
     type: String,
     default: 30,
    },
   },
  ],
 },
 { collation: { locale: "en" } }
);

module.exports = mongoose.model("subscriptions", schema);
