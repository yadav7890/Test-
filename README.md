Here's a comprehensive documentation for both the frontend and backend components, explaining the structure, functionality, and purpose of each part.

---

## Backend Documentation

### Overview

The backend is built with **Node.js**, **Express**, and **MongoDB**. It provides RESTful APIs to fetch and process transaction data. The data is initialized from a third-party API and stored in MongoDB.

### Requirements

- **Node.js** and **npm**
- **MongoDB** instance (local or hosted)
- Install dependencies with `npm install express mongoose axios`.

### File Structure

```plaintext
.
├── server.js            # Main backend server file
└── models
    └── Transaction.js   # Mongoose schema for transactions
```

### API Endpoints

#### 1. `/initialize` (GET)

- **Purpose**: Fetches data from an external API, clears existing MongoDB transaction data, and initializes the database with new transaction data.
- **Method**: `GET`
- **Usage**: Seed the MongoDB database with sample data.

#### 2. `/transactions` (GET)

- **Purpose**: Lists transactions with optional search and pagination.
- **Query Parameters**:
  - `month` (string) - Required. Filters transactions by the selected month.
  - `search` (string) - Optional. Filters transactions by title, description, or price.
  - `page` (number) - Optional. Specifies the page number for pagination (default is 1).
  - `perPage` (number) - Optional. Specifies the number of transactions per page (default is 10).
- **Usage**: Retrieve a paginated and/or filtered list of transactions.

#### 3. `/statistics` (GET)

- **Purpose**: Returns summary statistics for the selected month, including total sales amount, sold items, and unsold items.
- **Query Parameters**:
  - `month` (string) - Required. Filters transactions by the selected month.
- **Usage**: Fetch statistics for a given month.

#### 4. `/bar-chart` (GET)

- **Purpose**: Returns data for a bar chart showing item count within predefined price ranges.
- **Query Parameters**:
  - `month` (string) - Required. Filters transactions by the selected month.
- **Usage**: Generate data for displaying a bar chart of item counts by price range.

#### 5. `/pie-chart` (GET)

- **Purpose**: Returns data for a pie chart showing item count by category.
- **Query Parameters**:
  - `month` (string) - Required. Filters transactions by the selected month.
- **Usage**: Generate data for displaying a pie chart of item counts by category.

### Example Code (server.js)

The `server.js` file implements the backend APIs using Express. Below is a brief walkthrough of its main sections:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = 5000;

// MongoDB Model (Transaction Schema)
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
});

// Endpoint Implementations

// Initialize the database with external data
app.get('/initialize', async (req, res) => { /* code here */ });

// List transactions with search and pagination
app.get('/transactions', async (req, res) => { /* code here */ });

// Get statistics (total sales, sold and unsold items)
app.get('/statistics', async (req, res) => { /* code here */ });

// Get bar chart data for price ranges
app.get('/bar-chart', async (req, res) => { /* code here */ });

// Get pie chart data for categories
app.get('/pie-chart', async (req, res) => { /* code here */ });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

### MongoDB Schema (models/Transaction.js)

Defines the structure of a transaction document in MongoDB:

```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    category: String,
    dateOfSale: Date,
    sold: Boolean
});

module.exports = mongoose.model('Transaction', transactionSchema);
```

---

## Frontend Documentation

### Overview

The frontend is a **React** application that connects to the backend API and provides a dashboard interface for displaying transaction data, statistics, and visualizations (bar and pie charts).

### Requirements

- **React** (create the app using `npx create-react-app mern-frontend`)
- **Axios** for HTTP requests
- **Chart.js** and **react-chartjs-2** for charts
- Install dependencies with `npm install axios chart.js react-chartjs-2`

### File Structure

```plaintext
.
└── src
    ├── App.js             # Main React component
    ├── api.js             # API utility for backend requests
    └── components
        ├── TransactionsTable.js  # Component for transaction table
        ├── Statistics.js         # Component for statistics display
        ├── BarChart.js           # Component for bar chart
        └── PieChart.js           # Component for pie chart
```

### Component Documentation

#### App.js

The main component that manages the state for:
- `month`: Selected month for filtering data.
- `search`: Search term to filter transactions by title, description, or price.
- `transactions`: List of filtered transactions.
- `statistics`: Summary statistics (total sales, sold items, and unsold items).
- `barChartData`: Data for the bar chart.
- `pieChartData`: Data for the pie chart.

This component also includes dropdowns, search input, and calls each of the individual components.

#### TransactionsTable.js

Displays a table of transactions with columns for title, description, price, date of sale, and sold status.

```javascript
function TransactionsTable({ transactions }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Date of Sale</th>
                    <th>Sold</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                        <td>{transaction.title}</td>
                        <td>{transaction.description}</td>
                        <td>${transaction.price}</td>
                        <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                        <td>{transaction.sold ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
```

#### Statistics.js

Displays summary statistics, including total sales amount, total sold items, and total not sold items.

```javascript
function Statistics({ statistics }) {
    return (
        <div className="statistics">
            <div><strong>Total Sales Amount:</strong> ${statistics.totalSales}</div>
            <div><strong>Total Sold Items:</strong> {statistics.totalSoldItems}</div>
            <div><strong>Total Not Sold Items:</strong> {statistics.totalNotSoldItems}</div>
        </div>
    );
}
```

#### BarChart.js

Displays a bar chart of item counts within specific price ranges. The data is passed as props and displayed using `react-chartjs-2`.

```javascript
import { Bar } from 'react-chartjs-2';

function BarChart({ data }) {
    const labels = ['0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901+'];
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Number of Items',
                data,
                backgroundColor: 'rgba(75,192,192,0.6)',
            },
        ],
    };

    return <Bar data={chartData} />;
}
```

#### PieChart.js

Displays a pie chart of item counts by category.

```javascript
import { Pie } from 'react-chartjs-2';

function PieChart({ data }) {
    const labels = data.map((item) => item._id);
    const chartData = {
        labels,
        datasets: [
            {
                data: data.map((item) => item.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            },
        ],
    };

    return <Pie data={chartData} />;
}
```

### API Utility (api.js)

Handles API requests from the frontend to the backend.

```javascript
import axios from 'axios';
const API_URL = 'http://localhost:5000';

export const initializeDatabase = () => axios.get(`${API_URL}/initialize`);
export const getTransactions = (params) => axios.get(`${API_URL}/transactions`, { params });
export const getStatistics = (params) => axios.get(`${API_URL}/statistics`, { params });
export const getBarChartData = (params) => axios.get(`${API_URL}/bar-chart`, { params });
export const getPieChartData = (params) => axios.get(`${API_URL}/pie-chart`, { params
