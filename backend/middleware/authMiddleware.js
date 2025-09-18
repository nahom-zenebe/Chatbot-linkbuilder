require('dotenv').config()
const jwt = require("jsonwebtoken");

module.exports = async(req, res, next) => {
  const token = req.cookies.UserCookie;

  if (!token)  return res.status(401).json({ message: "Unauthorized: No token provided." });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
   
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};
