import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, role FROM users");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:userId/role", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { role } = req.body;
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      req.params.userId,
    ]);
    res.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
