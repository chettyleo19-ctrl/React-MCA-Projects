import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("MySQL Connection Failed:", err.message);
        return;
    }

    console.log("MySQL Connected Successfully!");
});

// Export database connection
export default db;