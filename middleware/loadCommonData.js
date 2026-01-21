let categoryModel = require("../models/Category");
let settingModel = require("../models/Setting");
let newsModel = require("../models/News");
const NodeCache = require("node-cache");
const cache = new NodeCache();
let commonData = async (req, res, next) => {
  try {
    let settings = cache.get("settingsCache");
    let category = cache.get("categoryCache");
    let latestNews = cache.get("latestNewsCache");
    if (!settings && !category) {
      settings = await settingModel.find().lean();
      let newsCategory = await newsModel.distinct("category");
      category = await categoryModel
        .find({ _id: { $in: newsCategory } })
        .lean();

      latestNews = await newsModel
        .find()
        .populate("author", "fullname")
        .populate("category", { name: 1, slug: 1 })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      cache.set("latestNewsCache", latestNews, 60 * 60 * 24);
      cache.set("settingsCache", settings, 60 * 60 * 24);
      cache.set("categoryCache", category, 60 * 60 * 24);
    }

    let news = await newsModel
      .find()
      .populate("author", "fullname")
      .populate("category", { name: 1, slug: 1 })
      .sort({ createdAt: -1 });

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
