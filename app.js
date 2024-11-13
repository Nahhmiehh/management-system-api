const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

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
const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

app.post('/api/registration', async (req, res) => {
  const { fullName, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, username, password: hashedPassword });
  await newUser.save();
  res.status(201).json(newUser);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    res.status(200).json({ user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/registration/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.put('/api/registration/:id', async (req, res) => {
  const { id } = req.params;
  const { fullName, username } = req.body;

  try {
      const updatedUser = await User.findByIdAndUpdate(
          id,
          { fullName, username },
          { new: true } // Return the updated document
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
  } catch (error) {
      console.error('Error updating user information:', error);
      res.status(500).json({ message: 'Server error updating user information' });
  }
});

// Product Model
const ProductSchema = new mongoose.Schema({
  product_code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  date_added: { type: Date, default: Date.now },
});
const Product = mongoose.model('Product', ProductSchema);

// CRUD Endpoints for Products
app.post('/api/products', async (req, res) => {
  try {
    const { product_code, name, description, price, qty, date_added } = req.body;
    const newProduct = new Product({ product_code, name, description, price, qty, date_added });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

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

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { product_code, name, description, price, qty, date_added } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, { product_code, name, description, price, qty, date_added }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
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
