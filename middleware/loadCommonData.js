let categoryModel = require("../models/Category");
let settingModel = require("../models/Setting");
let newsModel = require("../models/News");
let commonData = async (req, res, next) => {
  try {
    let news = await newsModel
      .find()
      .populate("author", "fullname")
      .populate("category", { name: 1, slug: 1 })
      .sort({ createdAt: -1 });
    let newsCategory = await newsModel.distinct("category");
    let category = await categoryModel.find({ _id: { $in: newsCategory } });
    let settings = await settingModel.find();
     let latestNews = await newsModel
          .find()
          .populate("author", "fullname")
          .populate("category", { name: 1, slug: 1 })
          .sort({ createdAt: -1 })
          .limit(5);
    res.locals.category = category;
    res.locals.settings = settings;
    res.locals.news = news;
    res.locals.latestNews = latestNews;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = commonData;
