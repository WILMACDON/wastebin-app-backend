const User = require("../models/UserModel");
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
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role, address, phoneNumber } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
    address,
    phoneNumber,
  });
  createSendToken(newUser, 201, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
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
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }
  //   // 4) Check if user changed password after the token was issued
  //   if (currentUser.changedPasswordAfter(decoded.iat)) {
  //     return next(
  //       new AppError("User recently changed password! Please login again.", 401)
  //     );
  //   }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// Restrict routes to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin", "user"]. role="user"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
