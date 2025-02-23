import React, { useState, useEffect } from 'react';
import axios from './utils/axios';

const Transactions = () => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');  // Track username
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState('income');  // 'income' or 'expense'
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/transactions/${username}`);
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/transactions', {
                username,
                type,
                amount,
                category,
                date,
            });
            setMessage('Transaction added successfully');
            fetchTransactions(); // Refresh the transactions list
        } catch (err) {
            setMessage(err.response.data.error);
        }
    };

    useEffect(() => {
        if (username) {
            fetchTransactions();
        }
    }, [username]);

    return (
        <div>
            <h2>Transactions</h2>

            {/* Form for adding transaction */}
            <form onSubmit={handleAddTransaction}>
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <button type="submit">Add Transaction</button>
            </form>

            {/* Display message */}
            {message && <p>{message}</p>}

            {/* List of Transactions */}
            <ul>
                {transactions.map((transaction) => (
                    <li key={transaction._id}>
                        {transaction.type}: {transaction.amount} in {transaction.category} on {new Date(transaction.date).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Transactions;
