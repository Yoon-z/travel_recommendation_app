const mongoose = require('mongoose')
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String,
  },
  green_point: {
    type: Number,
    default: 0,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  saved: {
    type: Map,
    of: String,
  },
});

userSchema.methods.verifyPassword = async function (password) {
  const user = this;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

const userModel = mongoose.model("user_account", userSchema)
module.exports = userModel