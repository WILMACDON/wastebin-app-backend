const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const AppError = require("./Utilities/appError");
const globalErrorHandler = require("./controller/errorController");
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
const thingspeakRouter = require("./routes/thingspeakRoutes");

//create express app
const app = express();

// Set the view engine to EJS
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
    },
  })
);

// Apply middleware to the application
if (process.env.NODE_ENV === "development") {
  // Log HTTP requests to the console during development only
  app.use(morgan("dev"));
}

//compress all responses
app.use(compression());

//parse request body as JSON
app.use(express.json());

// Serve static files from a directory
app.use(express.static(`${__dirname}/public`));

// Add middleware that adds a `requestTime` property to the request object with the current date and time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Enable CORS for all requests
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
    credentials: true, // Allow credentials to be shared between origins
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Routes
// Add CORS handling middleware to allow cross-origin requests to the API
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/thingspeak", thingspeakRouter);

// Handle all undefined routes by throwing a custom error with a 404 status code
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Add global error handling middleware to the application
app.use(globalErrorHandler);

// Export the Express application instance
module.exports = app;
