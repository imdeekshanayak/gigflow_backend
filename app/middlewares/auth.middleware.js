const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const decoded = jwt.verify(token, "supersecretkey");


    req.userId = decoded.userId;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;