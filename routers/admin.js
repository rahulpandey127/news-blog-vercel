let express = require("express");
let router = express.Router();
let isLogged = require("../middleware/isLogin");
let isAdmin = require("../middleware/isAdmin");
let upload = require("../middleware/multer");
let settingModel = require("../models/Setting");
let isValid = require("../middleware/validation");

let {
  loginPage,
  adminLogin,
  dashboard,
  settings,
  savesetting,
  logout,
} = require("../controllers/userController");

let {
  allUser,
  addUserPage,
  addUser,
  updateUserPage,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

let {
  allCategory,
  addCategoryPage,
  addCategory,
  updateCategoryPage,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

let {
  allArticle,
  addArticlePage,
  addArticle,
  updateArticlePage,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");

let { allComments, statusUpdate } = require("../controllers/commentController");
const { validate } = require("../models/User");

//Login Routes
router.get("/", loginPage);
router.post("/index", isValid.loginValidation, adminLogin);
router.get("/logout", isLogged, logout);
router.get("/dashboard", isLogged, dashboard);
router.get("/settings", isLogged, isAdmin, settings);
router.post(
  "/savesetting",
  isLogged,
  isAdmin,
  upload.single("website_logo"),
  savesetting,
);

//User CRUD Routes
router.get("/users", isLogged, isAdmin, allUser);
router.get("/add-user", isLogged, isAdmin, addUserPage);
router.post("/add-user", isLogged, isAdmin, isValid.addUserValidate, addUser);
router.get("/update-user/:id", isLogged, isAdmin, updateUserPage);
router.post("/update-user/:id", isLogged, isAdmin, updateUser);
router.delete("/delete-user/:id", isLogged, isAdmin, deleteUser);

//Category CRUD Routes
router.get("/category", isLogged, isAdmin, allCategory);
router.get("/add-category", isLogged, isAdmin, addCategoryPage);
router.post(
  "/add-category",
  isLogged,
  isAdmin,
  isValid.categoryValidate,
  addCategory,
);
router.get("/update-category/:id", isLogged, isAdmin, updateCategoryPage);
router.post("/update-category/:id", isLogged, isAdmin, updateCategory);
router.delete("/delete-category/:id", isLogged, isAdmin, deleteCategory);

//Category CRUD Routes
router.get("/article", isLogged, allArticle);
router.get("/add-article", isLogged, addArticlePage);
router.post(
  "/add-article",
  isLogged,
  upload.single("image"),
  isValid.articleValidate,
  addArticle,
);
router.get("/update-article/:id", isLogged, updateArticlePage);
router.post(
  "/update-article/:id",
  isLogged,
  upload.single("image"),
  isValid.articleValidate,
  updateArticle,
);
router.delete("/delete-article/:id", isLogged, deleteArticle);

//Comment CRUD Routes
router.get("/comments", isLogged, allComments);
router.put("/status-update/:id", isLogged, statusUpdate);

//404 middleware
//when page not found
router.use(isLogged, async (req, res, next) => {
  let settings = await settingModel.find();
  res.status(404).render("admin/404", {
    settings,
    role: req.role,
    message: "Page Not Found",
  });
});

// router.use(isLogged, async (error, req, res, next) => {
//   let settings = await settingModel.find();
//   res.status(404).render("admin/404", {
//     settings,
//     role: req.role,
//     message: error.message || "Page Not Found",
//   });
// });

//404 Error and 500 Error  middleware
router.use(isLogged, async (err, req, res, next) => {
  let settings = await settingModel.find();
  let status = err.status || 500;
  let view;
  switch (status) {
    case 401:
      view = "admin/401";
      break;
    case 404:
      view = "admin/404";
      break;
    case 500:
      view = "admin/500";
      break;
    default:
      view = "admin/500";
  }
  res.status(status).render(view, {
    message: err.message || "Internal Server Error",
    settings,
    role: req.role,
  });
});
module.exports = router;
