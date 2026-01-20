let { body } = require("express-validator");

let loginValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .matches(/^\S+$/)
    .withMessage("username must not contain spaces")
    .isLength({ min: 5, max: 15 })
    .withMessage("username must be at least 5 characters"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({
      min: 3,
      max: 10,
    })
    .withMessage("password must be at least 3 characters"),
];

let addUserValidate = [
  body("fullname")
    .notEmpty()
    .withMessage("fullname is required")
    .isLength({
      min: 3,
      max: 15,
    })
    .withMessage("fullname must be at least 3 characters"),
  ,
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 5, max: 15 })
    .withMessage("username must be at least 5 characters"),
  ,
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({
      min: 3,
      max: 10,
    })
    .withMessage("password must be at least 3 characters"),
  ,
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn(["author", "admin"])
    .withMessage("role must be author or admin"),
];

let updateUserValidate = [
  body("fullname")
    .optional({ checkFalsy: true })
    .isLength({
      min: 3,
      max: 15,
    })
    .withMessage("fullname must be at least 3 characters"),
  ,
  body("password")
    .optional({ checkFalsy: true })
    .isLength({
      min: 3,
      max: 10,
    })
    .withMessage("password must be at least 3 characters"),
  ,
  body("role")
    .optional({ checkFalsy: true })
    .isIn(["author", "admin"])
    .withMessage("role must be author or admin"),
];

let categoryValidate = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage("category name must be at least 3 characters"),
  body("description")
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("description must be at least 3 characters"),
];

let articleValidate = [
  body("title")
    .trim()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("title must be at least 3 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("content is required")
    .isLength({ min: 7 })
    .withMessage("content must be at least 7 characters"),
  body("category").trim().notEmpty().withMessage("category is required"),
];

module.exports = {
  loginValidation,
  addUserValidate,
  categoryValidate,
  articleValidate,
};
