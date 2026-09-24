import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// LOGIN API
router.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Check empty fields
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Find user in database
    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        // User not found
        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = results[0];

        try {
            // Compare password with hashed password
            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            // Create JWT token
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({
                message: "Login failed"
            });
        }
    });
});

export default router;