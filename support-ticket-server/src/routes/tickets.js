import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { pool } from '../db.js';

const router = express.Router();

// Create ticket (User)
router.post('/', auth, async (req, res) => {
  try {
    const { subject, description } = req.body;
    const customer_id = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO tickets (subject, description, customer_id) VALUES (?, ?, ?)',
      [subject, description, customer_id]
    );

    res.status(201).json({ message: 'Ticket created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tickets (Admin)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const [tickets] = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's tickets
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const [tickets] = await pool.query(
      'SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get executive's assigned tickets
router.get('/executive/:executiveId', auth, authorize(['executive']), async (req, res) => {
  try {
    const [tickets] = await pool.query(
      'SELECT * FROM tickets WHERE executive_id = ? ORDER BY created_at DESC',
      [req.params.executiveId]
    );
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign executive to ticket (Admin)
router.put('/:ticketId/assign', auth, authorize(['admin']), async (req, res) => {
  try {
    const { executive_id } = req.body;
    await pool.query(
      'UPDATE tickets SET executive_id = ? WHERE id = ?',
      [executive_id, req.params.ticketId]
    );
    res.json({ message: 'Executive assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket status (Executive)
router.put('/:ticketId/status', auth, authorize(['executive']), async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      'UPDATE tickets SET status = ? WHERE id = ? AND executive_id = ?',
      [status, req.params.ticketId, req.user.id]
    );
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;