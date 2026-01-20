const multer = require("multer");
const path = require("path");

//
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    //  file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    let newFileName =
      file.fieldname + Date.now() + path.extname(file.originalname);
    cb(null, newFileName);
  },
});

let fileFilter = (req, file, cb) => {
  if (file.fieldname === "file") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only files in pdf are allowed !"), false);
    }
  } else if (file.fieldname === "image" || "website_logo") {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed !"), false);
    }
  } else {
    cb(new Error("Unknown fields !"), false);
  }
};

let upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
