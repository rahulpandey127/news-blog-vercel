let express = require("express");
let router = express.Router();

let {
  index,
  articleByCategories,
  singleArticle,
  search,
  author,
  addComments,
} = require("../controllers/siteController");
let loadCommonData = require("../middleware/loadCommonData");

router.use(loadCommonData);

router.get("/", index);
router.get("/category/:name", articleByCategories);
router.get("/single/:id", singleArticle);
router.get("/search", search);
router.get("/author/:name", author);
router.post("/add-comments/:id", addComments);

//middleware for 404 error
router.use(async (req, res, next) => {
  res.status(404).render("404", {
    message: "Page Not Found",
  });
});

router.use(async (err, req, res, next) => {
  let status = err.status || 500;
  res.status(status).render('errors', {
    message: err.message || "Something went wrong",
    status
  });
});
module.exports = router;
