const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String, // 'income' or 'expense'
    amount: Number,
    category: String,
    date: Date
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Budget Schema
const BudgetSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    category: String
});
const Budget = mongoose.model('Budget', BudgetSchema);

// Register User
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful', userId: user._id });
});

// Add Transaction (Auto Assign userId)
app.post('/api/transactions', async (req, res) => {
    const { username, type, amount, category, date } = req.body;

    // Check if required fields are present
    if (!username || !type || !amount || !category || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new transaction associated with the userId
        const transaction = new Transaction({ 
            userId: user._id, 
            type, 
            amount, 
            category, 
            date: new Date(date)  // Ensure date is in proper format
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Transactions by Username
app.get('/api/transactions/:username', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const transactions = await Transaction.find({ userId: user._id });
        res.json(transactions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add Budget (Auto Assign userId)
app.post('/api/budget', async (req, res) => {
    const { username, amount, category } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const budget = new Budget({
            userId: user._id,
            amount,
            category
        });

        await budget.save();
        res.status(201).json(budget);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Budget by Username
app.get('/api/budget/:username', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const budget = await Budget.find({ userId: user._id });
        res.json(budget);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
