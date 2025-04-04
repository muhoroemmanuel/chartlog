import db from '../../../db';

export default function handler(req, res) {
  const tradeId = req.query.id;

  if (req.method === 'PUT') {
    // Update a trade
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
      res.status(200).json({ message: 'Trade updated successfully' });
    });
  } else if (req.method === 'DELETE') {
    // Delete a trade
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
      res.status(200).json({ message: 'Trade deleted successfully' });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 