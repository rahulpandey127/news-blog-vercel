const mongoose = require("mongoose");
let slugify = require("slugify");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

categorySchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

module.exports = mongoose.model("Category", categorySchema);
