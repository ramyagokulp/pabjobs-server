const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    day_title: {
      type: String,
      required: true,
    },
    day_jobType: {
      type: String,
      required: true
    },
    day_experience: {
      type: String,
      required: true
    },
    day_time: {
        type: String,
        required: true
      },
    day_description: {
      type: String,
      required: true
    },
    day_salary: {
        type: String,
        required: true
      },
      day_cities: [String],
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("dayjob", schema);
