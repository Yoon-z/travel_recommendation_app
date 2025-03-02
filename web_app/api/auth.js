const express = require('express');
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");
const router = express.Router();
const bcrypt = require("bcrypt");
require('dotenv').config();
const secret = process.env.JWT_SECRET;

/**
 * GET /auth
 * Verifies the JWT token from cookies and returns user information if valid.
 * 
 * Query Parameters:
 * - token (string): JWT token stored in cookies.
 * 
 * Returns:
 * - User information if the token is valid.
 * - 401 Unauthorized if the token is invalid or missing.
 */
router.get('/', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    res.json(info);
  });
});

/**
 * POST /auth/logout
 * Logs out the user by clearing the JWT token from cookies.
 * 
 * Returns:
 * - A success message ('ok') after clearing the token.
 */
router.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
})

/**
 * POST /auth/login
 * Authenticates the user using email and password, then issues a JWT token.
 * 
 * Body Parameters:
 * - email (string): The user's email address.
 * - password (string): The user's password.
 * 
 * Returns:
 * - A success message ('ok') and sets a JWT token in cookies if login is successful.
 * - 400 Bad Request if the email or password is invalid.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  console.log(email);

  if (!user) return res.status(400).send("Invalid email address or password.");

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(400).send("Invalid email address or password.");

  jwt.sign(
    { email, id: user._id, username: user.username, age: user.age, phoneNumber: user.phoneNumber, address: user.address, green_point: user.green_point },
    secret,
    { expiresIn: '1h' },
    (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json('ok');
    }
  );
});

/**
 * POST /auth/register
 * Registers a new user by saving their details to the database with hashed password.
 * 
 * Body Parameters:
 * - username (string): The user's desired username.
 * - email (string): The user's email address.
 * - password (string): The user's password.
 * 
 * Returns:
 * - A success message with the new user's ID if registration is successful.
 * - 400 Bad Request if an account with the provided email already exists.
 * - 500 Internal Server Error for server-side issues.
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, age, phoneNumber, address } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Exsits account with this email address." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new userModel({
      username,
      email,
      password: hashedPassword,
      age,
      phoneNumber,
      address,
      green_point: 0,

    });

    const savedUser = await user.save();
    res.json({
      message: "User registered successfully",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;