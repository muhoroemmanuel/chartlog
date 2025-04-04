import db from '../../db';

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Create a new trade
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
  } else if (req.method === 'GET') {
    // Get all trades
    const query = 'SELECT * FROM trades';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error retrieving trades:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      res.status(200).json(results);
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 