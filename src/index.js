// Test CI/CD trigger
const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Create users table (run once)
const setupDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    console.log('Users table created or already exists');
  } catch (err) {
    console.error('Error creating users table:', err.message);
    process.exit(1); // Exit if table creation fails
  }
};

// GET / endpoint for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

// Login API
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Login successful', user: result.rows[0] });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register API (for testing)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );
    res.json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server only after the database is set up
const startServer = async () => {
  await setupDb();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();