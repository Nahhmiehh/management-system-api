const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 4000;

app.use(express.json());

const databaseURL = 'mongodb+srv://reyborres24:1246Cruta.@management-system.7636c.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(databaseURL,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected...."))
    .catch(err => console.log("MongoDB Connection error...."))


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Admin credentials
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});
