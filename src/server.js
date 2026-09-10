require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

async function initDB() {
    try {
        // Insert default admin user if none exists
        const resUsers = await pool.query('SELECT count(*) FROM users');
        if (parseInt(resUsers.rows[0].count) === 0) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123!', salt);
            await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
            console.log('Default admin user created.');
        }

        console.log('Connected to PostgreSQL and database initialized.');
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
}

app.listen(PORT, async () => {
    await initDB();
    console.log(`Server is running on port ${PORT}`);
});
