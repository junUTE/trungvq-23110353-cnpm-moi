const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Ban khong co quyen truy cap tai nguyen nay",
    });
  }

  next();
};

module.exports = requireAdmin;
