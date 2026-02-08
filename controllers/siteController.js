let mongoose = require("mongoose");

let categoryModel = require("../models/Category");
let newsModel = require("../models/News");
let userModel = require("../models/User");
let commentModel = require("../models/Comment");
let settingModel = require("../models/Setting");
let errorMessage = require("../utils/error-message");
let paginate = require("../utils/paginate");
let createError = require("../utils/error-message");

let index = async (req, res, next) => {
  // let news = await newsModel
  //   .find()
  //   .populate("author", "fullname")
  //   .populate("category", { name: 1, slug: 1 })
  //   .sort({ createdAt: -1 });
  let settings = await settingModel.find();
  let category = await categoryModel.find();
  let paginatedNews = await paginate(newsModel, {}, req.query, {
    populate: [
      { path: "category", select: "name slug" },
      { path: "author", select: "fullname" },
    ],
    sort: "-createdAt",
  });
  console.log(paginatedNews);
  try {
    res.render("index", { paginatedNews, settings, category });
  } catch (err) {
    next(err);
  }
};
let articleByCategories = async (req, res, next) => {
  try {
    const searchQuery = req.query.search ? req.query.search : "";
    let category = await categoryModel.findOne({ slug: req.params.name });
    if (!category) {
      return next(errorMessage("Category Not Found", 404));
    }
    let settings = await settingModel.find();
    if (!settings) {
      return next(errorMessage("Setting Not Found", 404));
    }
    const paginatedNews = await paginate(
      newsModel,
      { category: category._id },
      req.query,
      {
        populate: [
          { path: "category", select: "name slug" },
          { path: "author", select: "fullname" },
        ],
        sort: "-createdAt",
      },
    );

    let news = await newsModel
      .find({ category: category._id })
      .populate("author", "fullname")
      .populate("category", { name: 1, slug: 1 })
      .sort({ createdAt: -1 });
    console.log(paginatedNews);
    res.render("category", {
      settings,
      // category,
      news,
      paginatedNews,
      searchQuery,
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
};
let singleArticle = async (req, res) => {
  let news = await newsModel
    .findById(req.params.id)
    .populate("author", "fullname")
    .populate("category", "name");

  if (!news) {
    return next(errorMessage("News Not Found", 404));
  }

  let comments = await commentModel
    .find({ article: req.params.id, status: "approved" })
    .sort({ createdAt: -1 });

  res.render("single", { news, comments });
};
let search = async (req, res) => {
  const searchQuery = req.query.search;
  const paginatedNews = await paginate(
    newsModel,
    {
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ],
    },
    req.query,
    {
      populate: [
        { path: "category", select: "name slug" },
        { path: "author", select: "fullname" },
      ],
      sort: "-createdAt",
    },
  );

  res.render("search", {
    paginatedNews,
    searchQuery,
    query: req.query,
  });
};
let author = async (req, res) => {
  let searchQuery = req.query.search ? req.query.search : "";
  const paginatedNews = await paginate(
    newsModel,
    {
      // $or: [
      //   { title: { $regex: searchQuery, $options: "i" } },
      //   { content: { $regex: searchQuery, $options: "i" } },
      // ],
      author: req.params.name,
    },
    req.query,
    {
      populate: [
        { path: "category", select: "name slug" },
        { path: "author", select: "fullname" },
      ],
      sort: "-createdAt",
    },
  );

  res.render("author", {
    paginatedNews,
    searchQuery,
    query: req.query,
  });
};
let addComments = async (req, res) => {
  try {
    let comment = new commentModel({ ...req.body, article: req.params.id });
    await comment.save();
    res.redirect(`/single/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  index,
  articleByCategories,
  singleArticle,
  search,
  author,
  addComments,
};
