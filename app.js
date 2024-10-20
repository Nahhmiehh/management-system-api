const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const databaseURL = 'mongodb+srv://reyborres24:1246Cruta.@management-system.7636c.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(databaseURL,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected...."))
    .catch(err => console.log("MongoDB Connection error...."))
    

// Sample User Model
const UserSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  password: String,
});
const User = mongoose.model('User', UserSchema);

// In-memory admin user
const adminUser = {
  username: 'admin',
  password: 'admin',
};

// Registration Endpoint
app.post('/api/registration', async (req, res) => {
  const { fullName, username, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = new User({ fullName, username, password });
  await newUser.save();
  res.status(201).json(newUser);
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Check for admin credentials
  if (username === adminUser.username && password === adminUser.password) {
      return res.status(200).json({ message: 'Admin login successful!' });
  }

  // Check for user in the database
  const user = await User.findOne({ username, password });
  if (user) {
      return res.status(200).json({ message: 'Login successful!' });
  } else {
      return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});