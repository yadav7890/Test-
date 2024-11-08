
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
    const [month, setMonth] = useState('March');
    const [search, setSearch] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [barChartData, setBarChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);

    // Fetch data on month or search change
    useEffect(() => {
        fetchData();
    }, [month, search]);

    // Function to fetch all data from the backend APIs
    const fetchData = async () => {
        try {
            const transactionsResponse = await axios.get('http://localhost:5000/transactions', {
                params: { month, search }
            });
            setTransactions(transactionsResponse.data);

            const statisticsResponse = await axios.get('http://localhost:5000/statistics', {
                params: { month }
            });
            setStatistics(statisticsResponse.data);

            const barChartResponse = await axios.get('http://localhost:5000/bar-chart', {
                params: { month }
            });
            setBarChartData(barChartResponse.data);

            const pieChartResponse = await axios.get('http://localhost:5000/pie-chart', {
                params: { month }
            });
            setPieChartData(pieChartResponse.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    return (
        <div className="App">
            <h1>Transactions Dashboard</h1>

            {/* Month selection dropdown */}
            <div>
                <label>Select Month:</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Search bar */}
            <div>
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Transactions Table */}
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

            {/* Statistics */}
            <div className="statistics">
                <div><strong>Total Sales Amount:</strong> ${statistics.totalSales}</div>
                <div><strong>Total Sold Items:</strong> {statistics.totalSoldItems}</div>
                <div><strong>Total Not Sold Items:</strong> {statistics.totalNotSoldItems}</div>
            </div>

            {/* Bar Chart */}
            <div>
                <h2>Price Range Distribution</h2>
                <Bar
                    data={{
                        labels: ['0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901+'],
                        datasets: [{
                            label: 'Number of Items',
                            data: barChartData,
                            backgroundColor: 'rgba(75,192,192,0.6)',
                        }],
                    }}
                    options={{ responsive: true }}
                />
            </div>

            {/* Pie Chart */}
            <div>
                <h2>Category Distribution</h2>
                <Pie
                    data={{
                        labels: pieChartData.map((item) => item._id),
                        datasets: [{
                            data: pieChartData.map((item) => item.count),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                        }],
                    }}
                    options={{ responsive: true }}
                />
            </div>
        </div>
    );
}

export default App;