import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Read the token from Cookies OR Header
  token = req.cookies.jwt;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
  }
  
  if (!token && req.headers.token) {
      token = req.headers.token;
  }

  // 2. Verify the Token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "flyem_secret_123");
      
      // 👇 THIS IS THE FIX: Check for 'userId' OR 'id' to prevent mismatches
      const requestUserId = decoded.userId || decoded.id;

      const user = await User.findById(requestUserId).select("-password");

      if (!user) {
          res.status(401);
          throw new Error("Not authorized, user not found (Account may have been deleted)");
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// ... keep admin and authorize functions exactly as they are ...
const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (req.user.isAdmin || req.user.role === 'superadmin') {
            return next();
        }
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403);
            throw new Error(`Access Denied: Requires ${roles.join(' or ')} role.`);
        }
    };
};

export { protect, admin, authorize };