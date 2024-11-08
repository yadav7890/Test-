const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = 5000;

// MongoDB Model
const transactionSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    category: String,
    dateOfSale: Date,
    sold: Boolean
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactions', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Initialize Database with Data from External API
app.get('/initialize', async (req, res) => {
    try {
        const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Transaction.deleteMany({});
        await Transaction.insertMany(data);
        res.send({ message: 'Database initialized with seed data.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to initialize database.' });
    }
});

// List Transactions with Search and Pagination
app.get('/transactions', async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;

    const filter = {
        dateOfSale: { $regex: new RegExp(-${month}-, 'i') },
        ...(search && {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { price: { $regex: search, $options: 'i' } }
            ]
        })
    };

    const transactions = await Transaction.find(filter)
        .skip((page - 1) * perPage)
        .limit(parseInt(perPage));

    res.json(transactions);
});

// Statistics API
app.get('/statistics', async (req, res) => {
    const { month } = req.query;
    const filter = { dateOfSale: { $regex: new RegExp(-${month}-, 'i') } };

    const totalSoldItems = await Transaction.countDocuments({ ...filter, sold: true });
    const totalNotSoldItems = await Transaction.countDocuments({ ...filter, sold: false });
    const totalSales = await Transaction.aggregate([
        { $match: { ...filter, sold: true } },
        { $group: { _id: null, totalAmount: { $sum: "$price" } } }
    ]);

    res.json({
        totalSales: totalSales[0]?.totalAmount || 0,
        totalSoldItems,
        totalNotSoldItems
    });
});

// Bar Chart API
app.get('/bar-chart', async (req, res) => {
    const { month } = req.query;
    const ranges = [
        { min: 0, max: 100 }, { min: 101, max: 200 }, { min: 201, max: 300 },
        { min: 301, max: 400 }, { min: 401, max: 500 }, { min: 501, max: 600 },
        { min: 601, max: 700 }, { min: 701, max: 800 }, { min: 801, max: 900 },
        { min: 901, max: Infinity }
    ];

    const results = await Promise.all(
        ranges.map(range =>
            Transaction.countDocuments({
                price: { $gte: range.min, $lt: range.max },
                dateOfSale: { $regex: new RegExp(-${month}-, 'i') }
            })
        )
    );

    res.json(results);
});

// Pie Chart API
app.get('/pie-chart', async (req, res) => {
    const { month } = req.query;

    const categories = await Transaction.aggregate([
        { $match: { dateOfSale: { $regex: new RegExp(-${month}-, 'i') } } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json(categories);
});

app.listen(PORT, () => console.log(Server running on http://localhost:${PORT}));