const express = require('express');
const router = express.Router();
const db = require('./db');

// Create a new trade
router.post('/trades', (req, res) => {
  const { currencyPair, action, entryPrice, stopLossPrice, takeProfitPrice, positionSize, notes } = req.body;
  const query = 'INSERT INTO trades (currency_pair, action, entry_price, stop_loss_price, take_profit_price, position_size, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [currencyPair, action, entryPrice, stopLossPrice, takeProfitPrice, positionSize, notes];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating trade:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.status(201).json({ message: 'Trade created successfully', tradeId: result.insertId });
  });
});

// Get all trades
router.get('/trades', (req, res) => {
  const query = 'SELECT * FROM trades';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving trades:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

// Update a trade
router.put('/trades/:id', (req, res) => {
  const tradeId = req.params.id;
  const { currencyPair, action, entryPrice, stopLossPrice, takeProfitPrice, positionSize, notes } = req.body;
  const query = 'UPDATE trades SET currency_pair = ?, action = ?, entry_price = ?, stop_loss_price = ?, take_profit_price = ?, position_size = ?, notes = ? WHERE id = ?';
  const values = [currencyPair, action, entryPrice, stopLossPrice, takeProfitPrice, positionSize, notes, tradeId];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating trade:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Trade not found' });
      return;
    }
    res.json({ message: 'Trade updated successfully' });
  });
});

// Delete a trade
router.delete('/trades/:id', (req, res) => {
  const tradeId = req.params.id;
  const query = 'DELETE FROM trades WHERE id = ?';

  db.query(query, [tradeId], (err, result) => {
    if (err) {
      console.error('Error deleting trade:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Trade not found' });
      return;
    }
    res.json({ message: 'Trade deleted successfully' });
  });
});

module.exports = router; 