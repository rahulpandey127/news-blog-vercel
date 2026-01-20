let categoryModel = require("../models/Category");
let settingModel = require("../models/Setting");
let errorMessage = require("../utils/error-message");
let newsModel = require("../models/News");

let addCategory = async (req, res, next) => {
  try {
    let { name, description } = req.body;
    await categoryModel.create({ name, description });
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};
let addCategoryPage = async (req, res) => {
  let settings = await settingModel.find();
  res.render("admin/categories/create", {
    settings,
    errors: 0,
    role: req.role,
  });
};
let allCategory = async (req, res, next) => {
  try {
    let categories = await categoryModel.find({});
    let settings = await settingModel.find();

    if (!categories) {
      return next(errorMessage("Category Not Found", 404));
    }
    res.render("admin/categories", {
      categories,
      settings,
      role: req.role,
      errors: 0,
    });
  } catch (err) {
    next(err);
  }
};
let updateCategory = async (req, res, next) => {
  // try {
  //   let { name, description } = req.body;

  //   let updateCategory = new categoryModel.updateOne(
  //     { _id: req.params.id },
  //     req.body
  //   );
  //   if (!updateCategory) {
  //     return next(errorMessage("Category Not Found", 404));
  //   }

  //   await updateCategory.save();
  //   res.redirect("/admin/category");
  // } catch (err) {
  //   next(err);
  // }
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category) {
      return next(errorMessage("Category Not Found", 404));
    }
    let { name, description } = req.body;
    category.name = name;
    category.description = description;
    await category.save();
    res.redirect("/admin/category");
  } catch (err) {
    next(err);
  }

};
let updateCategoryPage = async (req, res, next) => {
  try {
    let category = await categoryModel.findById(req.params.id);
    let settings = await settingModel.find();
    if (!category) {
      return next(errorMessage("Category Not Found", 404));
    }
    res.render("admin/categories/update", {
      category,
      role: req.role,
      errors: 0,
      settings,
    });
  } catch (err) {
    next(err);
  }
};
let deleteCategory = async (req, res) => {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category) {
      return next(errorMessage("Category Not Found", 404));
    }

    let article = await newsModel.findOne({ category: req.params.id });
    if (article) {
      return res.status(400).json({
        message: "Category is associated with an article",
        success: false,
      });
    }

    // await category.deleteOne(req.params.id);
    await categoryModel.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addCategory,
  addCategoryPage,
  allCategory,
  updateCategory,
  updateCategoryPage,
  deleteCategory,
};
