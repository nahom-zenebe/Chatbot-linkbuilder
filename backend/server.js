const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./router/userRoutes");
const sessionRoutes = require("./router/sessionRoutes");
const messageRoutes = require("./router/messageRoutes");
const feedbackRoutes = require("./router/feedbackRoutes");

const app = express();

// parse JSON bodies
app.use(express.json())
app.use(cookieParser())

// CORS setup for localhost frontend
app.use(cors({
  origin: "http://localhost:3000",  
  methods:["GET","POST","PUT","DELETE"],
  credentials: true               
}));


// Routes
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/feedback", feedbackRoutes);

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
