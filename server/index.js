const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./UserModel");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = "https://elite-walk-frontend.vercel.app"; // Your frontend's URL

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json());

const  mongoURI = "mongodb+srv://elitewalkuser:Elite@cluster0.vuducj4.mongodb.net/elitewalk?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

app.post("/register", async (req, res) => {
  console.log("Register request received:", req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.error("Missing field:", { name, email, password });
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const newUser = await User.create({ name, email, password: hashed });
    console.log("New user created:", newUser.email);

    return res.status(201).json({ success: true, user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid credentials" });

    return res.status(200).json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/", (req, res) => res.send("API is working"));

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
