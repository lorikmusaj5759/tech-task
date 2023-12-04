/* 
   Filename: ComplexCode.js
   
   Description: This code is a complex implementation of a web-based cryptocurrency exchange platform.
   
   Note: This code is purely fictional and does not include real functionalities or security measures. It is solely for demonstration purposes.
*/

// Import required libraries
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Create express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection setup
mongoose.connect('mongodb://localhost/cryptocurrency_exchange', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Mongoose schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
});

const transactionSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// API routes
app.post('/register', async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/transaction', async (req, res) => {
  try {
    const sender = await User.findOne({ username: req.body.sender });
    const receiver = await User.findOne({ username: req.body.receiver });
    
    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const amount = Number(req.body.amount);

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newTransaction = new Transaction({
      sender: sender.username,
      receiver: receiver.username,
      amount,
    });

    sender.balance -= amount;
    receiver.balance += amount;

    await Promise.all([newTransaction.save(), sender.save(), receiver.save()]);

    res.json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
