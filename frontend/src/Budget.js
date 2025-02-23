import React, { useState, useEffect } from 'react';
import axios from './utils/axios';

const Budget = () => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [budgets, setBudgets] = useState([]);
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const fetchBudget = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/budget/${username}`);
            setBudgets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/budget', {
                username,
                category,
                amount,
            });
            setMessage('Budget added successfully');
            fetchBudget(); // Refresh the budget list
        } catch (err) {
            setMessage(err.response.data.error);
        }
    };

    useEffect(() => {
        if (username) {
            fetchBudget();
        }
    }, [username]);

    return (
        <div>
            <h2>Budget</h2>

            {/* Form for adding budget */}
            <form onSubmit={handleAddBudget}>
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
                <button type="submit">Add Budget</button>
            </form>

            {/* Display message */}
            {message && <p>{message}</p>}

            {/* List of Budgets */}
            <ul>
                {budgets.map((budget) => (
                    <li key={budget._id}>
                        Category: {budget.category}, Amount: {budget.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Budget;
