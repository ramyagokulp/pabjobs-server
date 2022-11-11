const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    trainingType: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    },
    time: {
        type: String,
        required: true
      },
    description: {
      type: String,
      required: true
    },
    fees: {
        type: String,
        required: true
      },
    cities: [String],
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("sys", schema);
