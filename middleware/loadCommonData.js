let categoryModel = require("../models/Category");
let settingModel = require("../models/Setting");
let newsModel = require("../models/News");
const NodeCache = require("node-cache");
const cache = new NodeCache();
let commonData = async (req, res, next) => {
  try {
    let settings = cache.get("settingsCache");
    let category = cache.get("categoryCache");
    if (!settings && !category) {
      settings = await settingModel.find();
      let newsCategory = await newsModel.distinct("category");
      category = await categoryModel.find({ _id: { $in: newsCategory } });
      cache.set("settingsCache", settings);
      cache.set("categoryCache", category);
    }

    let news = await newsModel
      .find()
      .populate("author", "fullname")
      .populate("category", { name: 1, slug: 1 })
      .sort({ createdAt: -1 });

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
