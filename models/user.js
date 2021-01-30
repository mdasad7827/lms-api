const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  password: String,
  joined: {
    type: Date,
    default: Date.now(),
  },
  bookIssueInfo: [],
  violationFlag: {
    type: Boolean,

    default: false,
  },
  fines: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
