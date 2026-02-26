let categoryModel = require("../models/Category");
let newsModel = require("../models/News");
let settingModel = require("../models/Setting");
let errorMessage = require("../utils/error-message");
let { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
let path = require("path");
let fs = require("fs");

let allArticle = async (req, res, next) => {
  try {
    let articles;
    let settings = await settingModel.find();
    if (req.role == "admin") {
      articles = await newsModel
        .find({})
        .populate("author", "fullname")
        .populate("category", "name");
    } else {
      articles = await newsModel
        .find({ author: req.id })
        .populate("author", "fullname")
        .populate("category", "name");
    }
    res.render("admin/articles", {
      articles,
      settings,
      role: req.role,
      errors: 0,
    });
  } catch (error) {
    next(error);
  }
};

let addArticlePage = async (req, res) => {
  try {
    let categories = await categoryModel.find({});
    let settings = await settingModel.find();
    res.render("admin/articles/create", {
      settings,
      categories,
      errors: 0,
      role: req.role,
    });
  } catch (err) {
    next(err);
  }
};
let addArticle = async (req, res, next) => {
  console.log(req.body, req.file);
  let categories = await categoryModel.find({});
  let settings = await settingModel.find();
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return res.render("admin/articles/create", {
      role: req.role,
      settings,
      categories,
      errors: errors.array(),
    });
  }
  try {
    let { title, content, category } = req.body;
    // let image = req.file.filename;
    let imageFile = req.file;
    const uploadImage = await cloudinary.uploader.upload(imageFile.path);
    let image = uploadImage.secure_url;
    let article = new newsModel({
      title,
      content,
      category,
      author: req.id,
      image,
    });
    await article.save();

    res.redirect("/admin/article");
  } catch (error) {
    next(error);
  }
};
let updateArticlePage = async (req, res, next) => {
  let id = req.params.id;
  let settings = await settingModel.find();
  if (!settings) {
    return next(errorMessage("Setting Not Found", 404));
  }
  try {
    let article = await newsModel
      .findById(id)
      .populate("category", "name")
      .populate("author", "fullname");
    if (!article) {
      // let error = new Error("Article Not Found");
      // error.status = 404;
      // return next(error);
      return next(errorMessage("Article Not Found", 404));
    }
    if (req.role == "author") {
      if (req.id != article.author._id) {
        return res.status(401).send("Unauthorized user not allowed to update");
      }
    }
    let categories = await categoryModel.find({});
    res.render("admin/articles/update", {
      article,
      categories,
      settings,
      role: req.role,
      errors: 0,
    });
  } catch (error) {
    next(error);
  }
};
let updateArticle = async (req, res, next) => {
  let categories = await categoryModel.find({});
  let settings = await settingModel.find();
  if (!settings) {
    return next(errorMessage("Setting Not Found", 404));
  }
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return res.render("admin/articles/create", {
      role: req.role,
      settings,
      categories,
      errors: errors.array(),
    });
  }
  let article = await newsModel.findById(req.params.id);
  if (!article) {
    return next(errorMessage("Article Not Found", 404));
  }
  if (req.role == "author") {
    if (req.id != article.author._id) {
      return res.status(401).send("Unauthorized user not allowed to update");
    }
  }

  let { title, content, category } = req.body;
  try {
    let updateData = {
      title,
      content,
      category,
      author: req.id,
    };
    let imageFile = req.file;
    const website_logo = await cloudinary.uploader.upload(imageFile.path);
    updateData.image = website_logo.secure_url;

    await newsModel.findByIdAndUpdate(req.params.id, updateData);

    if (!updateData)
      return res.status(404).json({ message: "Article Not Found" });
    res.redirect("/admin/article");
  } catch (err) {
    next(err);
  }
};
let deleteArticle = async (req, res, next) => {
  try {
    let article = await newsModel.findById(req.params.id);
    if (!article) {
      return next(errorMessage("Article Not Found", 404));
    }

    if (req.role == "author") {
      if (req.id != article.author._id) {
        return res.status(401).send("Unauthorized user not allowed to update");
      }
    }

    let imagepath = path.join(__dirname, "../uploads/" + article.image);

    fs.unlinkSync(imagepath);

    await newsModel.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  allArticle,
  addArticlePage,
  addArticle,
  updateArticlePage,
  updateArticle,
  deleteArticle,
};
