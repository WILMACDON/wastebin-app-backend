const Admin = require("../models/adminModel"); // Import your Admin model
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AppError = require("../Utilities/appError");
const catchAsync = require("../Utilities/catchAsync");

dotenv.config({ path: "./config.env" });

// Create a token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Send token to client
const createSendToken = (admin, statusCode, res) => {
  const token = signToken(admin._id);
  // Remove password from output
  admin.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      admin,
    },
  });
};

// Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newAdmin = await Admin.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  createSendToken(newAdmin, 201, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if admin exists && password is correct
  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(admin, 200, res);
});

// Protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  // Check if authorization header exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Split the token from the header
    token = req.headers.authorization.split(" ")[1];
  }
  // Check if token exists
  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get access.", 401)
    );
  }
  // 2) Verification token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  // 3) Check if admin still exists
  const currentAdmin = await Admin.findById(decoded.id);
  if (!currentAdmin) {
    return next(
      new AppError("The admin belonging to this token no longer exists.", 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.admin = currentAdmin;
  next();
});

// Restrict routes to admin role
exports.restrictToAdmin = (req, res, next) => {
  if (req.admin.role !== "admin") {
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );
  }
  next();
};
