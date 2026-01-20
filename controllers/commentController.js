let commentModel = require("../models/Comment");
let settingModel = require("../models/Setting");
let errorMessage = require("../utils/error-message");
let newsModel = require("../models/News");
let allComments = async (req, res, next) => {
  try {
    let settings = await settingModel.find();
    if (!settings) {
      return next(errorMessage("Setting Not Found", 404));
    }

    let comments;
    if (req.role == "admin") {
      comments = await commentModel
        .find({})
        .populate("article", "title")
        .sort({ createdAt: -1 });
    } else {
      let news = await newsModel.find({ author: req.id });
      let newsId = news.map((n) => n._id);
      comments = await commentModel
        .find({ article: { $in: newsId } })
        .populate("article", "title")
        .sort({ createdAt: -1 });
    }
    console.log(comments);
    res.render("admin/comments", { comments, settings, role: req.role });
  } catch (err) {
    next(err);
  }
};

let statusUpdate = async (req, res, next) => {
  try {
    await commentModel.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  allComments,
  statusUpdate,
};
