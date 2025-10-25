const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Helper to read orders file
function readOrders() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { orders: [] };
  }
}

// Helper to write orders file
function writeOrders(obj) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

// Get all orders
app.get('/api/orders', (req, res) => {
  const data = readOrders();
  res.json(data);
});

// Create new order
app.post('/api/orders', (req, res) => {
  const data = readOrders();
  const orders = data.orders || [];

  const incoming = req.body;

  // Basic validation
  if (!incoming || !incoming.items || !Array.isArray(incoming.items) || incoming.items.length === 0) {
    return res.status(400).json({ error: 'Invalid order payload' });
  }

  // Generate id and order_number
  const nextId = (orders.length ? Math.max(...orders.map(o => Number(o.id) || 0)) : 0) + 1;
  const orderNumber = `ORD${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(nextId).padStart(4,'0')}`;

  const now = new Date().toISOString();

  const order = Object.assign({}, incoming, {
    id: String(nextId),
    order_number: orderNumber,
    created_at: incoming.created_at || now,
    status: incoming.status || 'pending',
  });

  orders.push(order);
  data.orders = orders;

  try {
    // Ensure data dir exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    writeOrders(data);
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Failed to write orders.json', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Serve static files for convenience (optional)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
