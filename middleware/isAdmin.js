let isAdmin = (req, res, next) => {
  if (req.role === "admin") {
    next();
  } else {
    // res.status(401).send("Unauthorized : Not Admin");
    res.redirect("/admin/dashboard");
  }
};

module.exports = isAdmin;
