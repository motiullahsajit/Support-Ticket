import express, { Request, Response } from "express";
import { auth, authorize } from "../middleware/auth.js";
import { pool } from "../db.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();

router.post("/", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, description } = req.body;
    const customer_id = req.user.id;

    const [result] = (await pool.query(
      "INSERT INTO tickets (subject, description, customer_id) VALUES (?, ?, ?)",
      [subject, description, customer_id]
    )) as any;

    res
      .status(201)
      .json({ message: "Ticket created successfully", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/",
  auth,
  authorize(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [tickets] = (await pool.query(
        `SELECT 
          tickets.*, 
          customer.username AS customer_username, 
          executive.username AS executive_username
        FROM tickets
        JOIN users AS customer ON tickets.customer_id = customer.id
        LEFT JOIN users AS executive ON tickets.executive_id = executive.id
        ORDER BY tickets.created_at DESC`
      )) as any;

      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/user/:userId",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [tickets] = (await pool.query(
        "SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC",
        [req.params.userId]
      )) as any;
      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/executive/:executiveId",
  auth,
  authorize(["executive"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [tickets] = (await pool.query(
        "SELECT * FROM tickets WHERE executive_id = ? ORDER BY created_at DESC",
        [req.params.executiveId]
      )) as any;
      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:ticketId/assign",
  auth,
  authorize(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { executive_id } = req.body;
      const ticketId = req.params.ticketId;

      const [executive] = (await pool.query(
        "SELECT * FROM users WHERE id = ? AND role = 'executive'",
        [executive_id]
      )) as any;

      if (executive.length === 0) {
        return res.status(400).json({ message: "Invalid executive ID" });
      }

      await pool.query("UPDATE tickets SET executive_id = ? WHERE id = ?", [
        executive_id,
        ticketId,
      ]);

      res.json({ message: "Executive assigned successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:ticketId/status",
  auth,
  authorize(["executive"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      await pool.query(
        "UPDATE tickets SET status = ? WHERE id = ? AND executive_id = ?",
        [status, req.params.ticketId, req.user.id]
      );
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:ticketId",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { subject, description } = req.body;
      const ticketId = req.params.ticketId;
      const [result] = (await pool.query(
        "UPDATE tickets SET subject = ?, description = ? WHERE id = ? AND customer_id = ?",
        [subject, description, ticketId, req.user.id]
      )) as any;

      if (result.affectedRows === 0) {
        return res
          .status(403)
          .json({ message: "Not authorized or ticket not found" });
      }
      res.json({ message: "Ticket updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/:ticketId",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ticketId = req.params.ticketId;
      const [result] = (await pool.query(
        "DELETE FROM tickets WHERE id = ? AND customer_id = ?",
        [ticketId, req.user.id]
      )) as any;

      if (result.affectedRows === 0) {
        return res
          .status(403)
          .json({ message: "Not authorized or ticket not found" });
      }
      res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:ticketId/manage",
  auth,
  authorize(["admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { executive_id, status } = req.body;
      const ticketId = req.params.ticketId;

      if (executive_id === null) {
        await pool.query(
          "UPDATE tickets SET executive_id = NULL WHERE id = ?",
          [ticketId]
        );
        return res.json({ message: "Executive unassigned successfully" });
      }

      if (status) {
        await pool.query("UPDATE tickets SET status = ? WHERE id = ?", [
          status,
          ticketId,
        ]);
        return res.json({ message: "Ticket status updated successfully" });
      }

      res.status(400).json({ message: "Invalid request" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
