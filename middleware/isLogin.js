let jwt = require("jsonwebtoken");
let isLogged = (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      return res.redirect("/admin/");
    }
    let tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.id = tokenData.id;
    req.fullname = tokenData.fullname;
    req.role = tokenData.role;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized : Invalid Token");
  }
};

module.exports = isLogged;
