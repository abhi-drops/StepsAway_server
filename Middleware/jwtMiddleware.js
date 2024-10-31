const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
  console.log("Inside jwtMiddleware");
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (token) {
      const jwtResponse = jwt.verify(token, process.env.JWT_SECRET);
      req.payload = jwtResponse.userId; // Ensure the entire payload is assigned
      console.log("Decoded JWT:", jwtResponse.userId);
      next();
    } else {
      res.status(401).json("Please provide token");
    }
  } catch (err) {
    console.log("JWT error:", err);
    res.status(403).json("Please login");
  }
};

module.exports = jwtMiddleware;
