let userModel = require("../models/User");
let newsModel = require("../models/News");
let settingModel = require("../models/Setting");
let categoryModel = require("../models/Category");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let dotenv = require("dotenv");
let cookie = require("cookie-parser");
let path = require("path");
let fs = require("fs");
const cloudinary = require("cloudinary").v2;
let errorMessage = require("../utils/error-message");
let { validationResult } = require("express-validator");
dotenv.config();
let loginPage = async (req, res) => {
  res.render("admin/login", { layout: false, errors: 0 });
};
let adminLogin = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return res.render("admin/login", { layout: false, errors: errors.array() });
  }

  try {
    let { username, password } = req.body;
    let user = await userModel.findOne({ username });
    let settings = await settingModel.find();

    if (!user) {
      return res.redirect("/admin/login");
    }

    let jwtData = {
      id: user._id,
      fullname: user.fullname,
      role: user.role,
    };
    let token = jwt.sign(jwtData, process.env.JWT_SECRET);
    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
    });
    let articles;
    if (req.role == "author") {
      articles = await newsModel.countDocuments({ author: req.id });
    } else {
      articles = await newsModel.countDocuments({});
    }

    let categories = await categoryModel.countDocuments({});
    let users = await userModel.countDocuments({});

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(errorMessage("Invalid Username or Password", 401));
    }

    res.render("admin/dashboard", {
      articles,
      categories,
      settings,
      users,
      fullname: req.fullname,
      role: req.role,
    });
  } catch (err) {
    next(errorMessage);
  }
};
let dashboard = async (req, res, next) => {
  try {
    let settings = await settingModel.find();
    let articles;
    if (req.role == "author") {
      articles = await newsModel.countDocuments({ author: req.id });
    } else {
      articles = await newsModel.countDocuments({});
    }

    let categories = await categoryModel.countDocuments({});
    let users = await userModel.countDocuments({});

    res.render("admin/dashboard", {
      settings,
      articles,
      categories,
      users,
      fullname: req.fullname,
      role: req.role,
    });
  } catch (err) {
    next(err);
  }
};

let settings = async (req, res, next) => {
  try {
    let settings = await settingModel.find();
    if (!settings) {
      return next(errorMessage("Setting Not Found", 404));
    }
    res.render("admin/settings", { settings, role: req.role });
  } catch (err) {
    next(err);
  }
};

//save settings
let savesetting = async (req, res, next) => {
  let { website_title, footer_description } = req.body;

  try {
    // let findImg = await settingModel.find();
    // let website_logo = req.file ? req.file.filename : null;
    let imageFile = req.file;
    const website_logo = await cloudinary.uploader.upload(imageFile.path);

    // if (findImg.length != 0 && req.file) {
    //   let filepath = path.join(
    //     __dirname,
    //     "../uploads/" + findImg[0].website_logo,
    //   );

    //   fs.unlinkSync(filepath);
    // }

    let saveData = await settingModel.findOneAndUpdate(
      {},
      {
        website_title,
        footer_description,
        website_logo: website_logo.secure_url,
      },
      { new: true, upsert: true },
    );

    res.redirect("/admin/settings");
  } catch (err) {
    next(err);
  }
};

let logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/");
};

let allUser = async (req, res, next) => {
  try {
    let users = await userModel.find({});

    let settings = await settingModel.find();
    if (!users) {
      return next(errorMessage("User Not Found", 404));
    }
    res.render("admin/users", { users, settings, role: req.role });
  } catch (err) {
    next(err);
  }
};
let addUserPage = async (req, res, next) => {
  try {
    let settings = await settingModel.find();
    if (!settings) {
      return next(errorMessage("Setting Not Found", 404));
    }
    res.render("admin/users/create", { settings, role: req.role, errors: 0 });
  } catch (err) {
    next(err);
  }
};

let addUser = async (req, res, next) => {
  let errors = validationResult(req);
  let settings = await settingModel.find();
  if (!errors.isEmpty()) {
    console.log(errors.isEmpty());
    // return res.status(400).json({ errors: errors.array() });
    return res.render("admin/users/create", {
      settings,
      role: req.role,
      errors: errors.array(),
    });
  }
  try {
    let user = await userModel.create(req.body);
    if (!user) {
      return next(errorMessage("User Not Found", 404));
    }
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
};

let updateUserPage = async (req, res, next) => {
  try {
    let id = req.params.id;
    let user = await userModel.findById(id);
    if (!user) {
      return next(errorMessage("User Not Found", 404));
    }
    res.render("admin/users/update", { user, role: req.role });
  } catch (err) {
    next(err);
  }
};
let updateUser = async (req, res, next) => {
  try {
    let { fullname, username, password, role } = req.body;
    let id = req.params.id;
    let user = await userModel.findById(id);

    if (!user) {
      return next(errorMessage("User Not Found", 404));
    }

    if (fullname) {
      user.fullname = fullname || user.fullname;
    }
    if (username) {
      user.username = username || user.username;
    }
    if (password) {
      user.password = password || user.password;
    }
    if (role) {
      user.role = role || user.role;
    }
    await user.save();

    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
};

let deleteUser = async (req, res, next) => {
  try {
    let id = req.params.id;
    let user = await userModel.findById(id);
    if (!user) {
      return next(errorMessage("User Not Found", 404));
    }

    let article = await newsModel.findOne({ author: req.params.id });
    console.log(article);
    if (article) {
      return res.status(400).json({
        success: false,
        message: "User has articles, can't delete",
      });
    }

    await userModel.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginPage,
  adminLogin,
  dashboard,
  settings,
  savesetting,
  logout,
  allUser,
  addUserPage,
  addUser,
  updateUserPage,
  updateUser,
  deleteUser,
};
