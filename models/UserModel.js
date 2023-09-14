const Mongooose = require("mongoose");
const Validator = require("validator");
const bcrypt = require("bcryptjs");
//create schema for user
const UserSchema = new Mongooose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Please provide a address"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
    lowercase: true,
    validate: [Validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
    },
    message: "Passwords are not the same!",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (el) {
        return el.length === 11;
      },
    },
    message: "Phone number must be 11 digits long",
  },
});

//encrypt password using bcryptjs
UserSchema.pre("save", async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//compare password
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//create model for user
const User = Mongooose.model("User", UserSchema);

module.exports = User;
