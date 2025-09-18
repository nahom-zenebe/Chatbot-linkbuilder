require("dotenv").config(); // load .env variables

const User = require("../model/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * User registration
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;


    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: hash,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,   // must be defined in .env
      { expiresIn: "7d" }
    );
    

    // Set token in cookie
    res.cookie("UserCookie", token, {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: "lax", // use 'lax' for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    

    res.status(201).json({ message: "User registered", user  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * User login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,   // must be defined in .env
      { expiresIn: "7d" }
    );
    

    // Set token in cookie
    res.cookie("UserCookie", token, {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: "lax", // use 'lax' for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Optional: Logout
 */
exports.logout = async (req, res) => {
  res.clearCookie("UserCookie");
  res.json({ message: "Logged out successfully" });
};
