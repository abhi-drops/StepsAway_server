// const jwt = require('jsonwebtoken');

// const jwtMiddleware = (req, res, next) => {
//   console.log("Inside jwtMiddleware");
//   try {
//     console.log("header:",req.headers);

//     const token = req.headers["authorization"].split(" ")[1];
//     console.log("token : ",token);

//     if (token) {
//       const jwtResponse = jwt.verify(token, process.env.JWT_SECRET);
//       req.payload = jwtResponse.userId; // Ensure the entire payload is assigned
//       console.log("Decoded JWT:", jwtResponse.userId);
//       next();
//     } else {
//       res.status(401).json("Please provide token");
//     }
//   } catch (err) {
//     console.log("JWT error:", err);
//     res.status(403).json("Please login");
//   }
// };

// module.exports = jwtMiddleware;

const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
  console.log("Inside jwtMiddleware");
  console.log("Request headers:", req.headers);

  try {
    const authHeader = req.headers["authorization"];

    // Check if Authorization header exists and follows the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization header is missing or not in the correct format");
      return res.status(401).json("Authorization header is missing or malformed");
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);

    // Verify the token
    const jwtResponse = jwt.verify(token, process.env.JWT_SECRET);
    req.payload = jwtResponse.userId; // Attach userId to the request
    console.log("Decoded JWT user ID:", jwtResponse.userId);
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(403).json("Invalid or expired token. Please log in.");
  }
};

module.exports = jwtMiddleware;

