let mongoose = require("mongoose");

let settingSchema = mongoose.Schema({
  website_title: {
    type: String,
    required: true,
  },
  website_logo: {
    type: String,
    required: true,
  },
  footer_description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Setting", settingSchema);
