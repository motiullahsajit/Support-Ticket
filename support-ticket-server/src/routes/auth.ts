import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, image_url } = req.body;

    const [existingUsers] = (await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    )) as any[];

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO users (name, username, email, password, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, username, email, hashedPassword, image_url || null]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [users] = (await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as any[];

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: "1d",
    });

    delete user.password;

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
