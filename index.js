const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const connectflash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const minifyHTML = require("express-minify-html-terser");
const compression = require("compression");
const app = express();

dotenv.config();

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(connectflash());
app.use("/uploads", express.static("uploads"));

app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");

app.use(
  minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
    },
  }),
); // Minify HTML

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

app.use(compression({ filter: shouldCompress }));
function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

// app.use(expressLayouts());
app.use("/admin", (req, res, next) => {
  res.locals.layout = "admin/layout";
  next();
});

app.use("/admin", require("./routers/admin"));

app.use("/", require("./routers/frontend"));

let port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Database connected");
  });
});
