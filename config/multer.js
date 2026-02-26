const multer = require("multer");

const storage = multer.diskStorage({});

const upload = multer({ storage: storage });
console.log("Hello Multer");
export default upload;
