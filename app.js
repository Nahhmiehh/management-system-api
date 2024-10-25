const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const databaseURL = 'mongodb+srv://reyborres24:1246Cruta.@management-system.7636c.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected....'))
  .catch(err => console.log('MongoDB Connection error....'));

// User Model
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

// Product Model
const ProductSchema = new mongoose.Schema({
  product_code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  date_added: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// Create a new product (POST)
app.post('/api/products', async (req, res) => {
  try {
    const { product_code, name, description, price, qty, date_added } = req.body;

    const newProduct = new Product({
      product_code,
      name,
      description,
      price,
      qty,
      date_added
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
});

// Get all products (GET)
app.get('/api/products', async (req, res) => {
  try {
      const products = await Product.find(); // Fetch all products
      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error });
  }
});

// Get a single product by ID (GET)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
});

// Update a product by ID (PUT)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { product_code, name, description, price, qty, date_added } = req.body;
  
  try {
      const updatedProduct = await Product.findByIdAndUpdate(id, {
          product_code, name, description, price, qty, date_added
      }, { new: true });  // Return the updated product
      if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(updatedProduct);
  } catch (error) {
      res.status(500).json({ message: 'Error updating product', error });
  }
});


// Delete a product by ID (DELETE)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
          return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting product', error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
