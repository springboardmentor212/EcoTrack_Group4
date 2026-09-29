const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const tokenString = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    // 1. Try normal JWT verification
    try {
      const decoded = jwt.verify(
        tokenString,
        process.env.JWT_SECRET || "ecotrack_secret_key_123"
      );

      // Normal JWT Login Fix
      req.user = {
        id: decoded.id || decoded._id || decoded.userId || decoded.googleId,
        googleId: decoded.googleId || decoded.sub,
        email: decoded.email,
        name: decoded.name
      };
      return next();
    } catch (jwtErr) {
      // 2. Fallback for Google Sign-In Tokens
      const decodedGoogleToken = jwt.decode(tokenString);
      if (decodedGoogleToken) {
        req.user = {
          id: decodedGoogleToken.sub || decodedGoogleToken.email,
          googleId: decodedGoogleToken.sub,
          email: decodedGoogleToken.email,
          name: decodedGoogleToken.name,
        };
        return next();
      }
      throw new Error("Invalid token structure");
    }
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};