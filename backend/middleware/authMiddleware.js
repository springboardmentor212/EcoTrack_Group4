const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token (Bearer <token>)
    const tokenString = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    const decoded = jwt.verify(
      tokenString,
      process.env.JWT_SECRET || "ecotrack_secret_key"
    );

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};