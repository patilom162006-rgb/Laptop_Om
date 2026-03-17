const path = require('path');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 4000;
const dbPath = path.join(__dirname, 'data', 'laptop-hub.db');
const db = new Database(dbPath);

app.use(cors());
app.use(express.json());
const frontendPath = path.join(__dirname, 'Laptop services wd');
app.use(express.static(frontendPath));

const LAPTOP_SEED = [
  {
    name: 'ASUS ROG Strix G16',
    category: 'Gaming',
    price: 125990,
    rating: 4.8,
    reviews: 248,
    specs: 'Intel i7-13650HX, RTX 4060, 16GB RAM, 1TB SSD',
    specsFull: {
      CPU: 'Intel i7-13650HX',
      GPU: 'RTX 4060',
      RAM: '16GB DDR5',
      Storage: '1TB NVMe SSD',
      Display: '16" 165Hz FHD',
      Battery: '90Wh',
      Weight: '2.3 kg'
    },
    description: 'The ASUS ROG Strix G16 is a powerhouse designed for competitive gaming, featuring an advanced cooling system and a high-refresh-rate display to give you the ultimate edge.',
    features: ['Aura Sync RGB', 'Tri-Fan Technology', 'Dolby Atmos Audio', 'Mux Switch'],
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80'
  },
  {
    name: 'MSI Katana 15',
    category: 'Gaming',
    price: 89990,
    rating: 4.5,
    reviews: 183,
    specs: 'Intel i5-12450H, RTX 4050, 16GB RAM, 512GB SSD',
    specsFull: {
      CPU: 'Intel i5-12450H',
      GPU: 'RTX 4050',
      RAM: '16GB DDR5',
      Storage: '512GB NVMe SSD',
      Display: '15.6" 144Hz FHD',
      Battery: '52.4Wh',
      Weight: '2.2 kg'
    },
    description: 'Sharpen your game with the MSI Katana 15. Inspired by the craftsmanship of the legendary blade, it\'s optimized to unleash true performance during gameplay.',
    features: ['Cooler Boost 5', 'Hi-Res Audio', 'Backlit Keyboard', 'Thin-Bezel Display'],
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80'
  },
  {
    name: 'HP OMEN 16',
    category: 'Gaming',
    price: 115990,
    rating: 4.7,
    reviews: 197,
    specs: 'AMD Ryzen 7, RTX 4060, 16GB RAM, 1TB SSD',
    specsFull: {
      CPU: 'AMD Ryzen 7 7745HX',
      GPU: 'RTX 4060',
      RAM: '16GB DDR5',
      Storage: '1TB NVMe SSD',
      Display: '16.1" 165Hz QHD',
      Battery: '83Wh',
      Weight: '2.45 kg'
    },
    description: 'Go beyond with the HP OMEN 16. With an AMD Ryzen processor and powerful graphics, it\'s built for those who demand performance and style in equal measure.',
    features: ['OMEN Tempest Cooling', 'DTS:X Ultra', 'RGB Keyboard', 'Flicker-Free Display'],
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80'
  },
  {
    name: 'Dell XPS 13',
    category: 'Business',
    price: 145990,
    rating: 4.9,
    reviews: 312,
    specs: 'Intel i7-13700H, Intel Iris Xe, 16GB RAM, 1TB SSD',
    specsFull: {
      CPU: 'Intel i7-13700H',
      GPU: 'Intel Iris Xe',
      RAM: '16GB LPDDR5',
      Storage: '1TB NVMe SSD',
      Display: '13.4" 120Hz FHD+',
      Battery: '55Wh',
      Weight: '1.27 kg'
    },
    description: 'The Dell XPS 13 combines elegance with extreme portability. Its stunning InfinityEdge display and premium materials make it the perfect companion for professionals on the go.',
    features: ['InfinityEdge Display', 'Machined Aluminum', 'Windows Hello', 'Backlit Keyboard'],
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80'
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    category: 'Business',
    price: 185990,
    rating: 4.9,
    reviews: 428,
    specs: 'Intel i7-13700U, Intel Iris Xe, 32GB RAM, 1TB SSD',
    specsFull: {
      CPU: 'Intel i7-13700U',
      GPU: 'Intel Iris Xe',
      RAM: '32GB LPDDR5',
      Storage: '1TB NVMe SSD',
      Display: '14" 60Hz WUXGA IPS',
      Battery: '57Wh',
      Weight: '1.12 kg'
    },
    description: 'The legendary ThinkPad X1 Carbon is the pinnacle of business mobility. Ultraslim, ultralight, and incredibly durable, it\'s designed for elite performance in any environment.',
    features: ['Mil-Spec Tested', 'PrivacyGuard', 'Rapid Charge', 'Spill-Resistant Keyboard'],
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80'
  },
  {
    name: 'HP EliteBook 840',
    category: 'Business',
    price: 135990,
    rating: 4.6,
    reviews: 156,
    specs: 'Intel i5-13500H, Intel Iris Xe, 16GB RAM, 512GB SSD',
    specsFull: {
      CPU: 'Intel i5-13500H',
      GPU: 'Intel Iris Xe',
      RAM: '16GB DDR5',
      Storage: '512GB NVMe SSD',
      Display: '14" 60Hz FHD IPS',
      Battery: '51Wh',
      Weight: '1.36 kg'
    },
    description: 'Work seamlessly with the HP EliteBook 840. High-performance features and robust security management tools ensure productivity wherever your business takes you.',
    features: ['HP Wolf Security', 'Bang & Olufsen Audio', 'NFC Support', 'Quiet Keyboard'],
    image: 'https://images.unsplash.com/photo-1593642534315-48ec5d3d5740?w=400&q=80'
  },
  {
    name: 'Acer Aspire 5',
    category: 'Student',
    price: 45990,
    rating: 4.3,
    reviews: 521,
    specs: 'AMD Ryzen 5, Radeon Graphics, 8GB RAM, 512GB SSD',
    specsFull: {
      CPU: 'AMD Ryzen 5 5500U',
      GPU: 'AMD Radeon',
      RAM: '8GB DDR4',
      Storage: '512GB SSD',
      Display: '15.6" 60Hz FHD',
      Battery: '57.5Wh',
      Weight: '1.9 kg'
    },
    description: 'The Acer Aspire 5 is an affordable, versatile laptop perfect for students. It offers consistent performance for daily tasks, from writing papers to streaming movies.',
    features: ['Elevated Hinge Design', 'Acer Color Intelligence', 'Narrow Bezel', 'Multiple Ports'],
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'
  },
  {
    name: 'HP Pavilion 15',
    category: 'Student',
    price: 55990,
    rating: 4.4,
    reviews: 345,
    specs: 'Intel i5-12450H, Intel UHD, 8GB RAM, 512GB SSD',
    specsFull: {
      CPU: 'Intel i5-12450H',
      GPU: 'Intel UHD Graphics',
      RAM: '8GB DDR4',
      Storage: '512GB SSD',
      Display: '15.6" 60Hz FHD IPS',
      Battery: '43.3Wh',
      Weight: '1.75 kg'
    },
    description: 'The HP Pavilion 15 offers a perfect balance of performance and portability. Its sleek design and long battery life make it ideal for campus life and beyond.',
    features: ['Fast Charge', 'HP Dual Speakers', 'Wide Vision HD Cam', 'Precision Touchpad'],
    image: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&q=80'
  },
  {
    name: 'Lenovo IdeaPad 3',
    category: 'Student',
    price: 42990,
    rating: 4.2,
    reviews: 612,
    specs: 'AMD Ryzen 5, Radeon Graphics, 8GB RAM, 256GB SSD',
    specsFull: {
      CPU: 'AMD Ryzen 5 5500U',
      GPU: 'AMD Radeon',
      RAM: '8GB DDR4',
      Storage: '256GB SSD',
      Display: '15.6" 60Hz FHD TN',
      Battery: '38Wh',
      Weight: '1.65 kg'
    },
    description: 'Designed for long-lasting performance, the Lenovo IdeaPad 3 is a reliable entry-level laptop with a clean design and user-friendly features for everyday use.',
    features: ['Physical Webcam Shutter', 'Dolby Audio', 'Silent Mode', 'Large Trackpad'],
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'
  }
];

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS laptops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      specs TEXT,
      description TEXT,
      specs_full TEXT,
      features TEXT,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS cart (
      laptop_id INTEGER PRIMARY KEY,
      qty INTEGER NOT NULL,
      FOREIGN KEY (laptop_id) REFERENCES laptops(id)
    );
    CREATE TABLE IF NOT EXISTS favourites (
      laptop_id INTEGER PRIMARY KEY,
      created_at TEXT,
      FOREIGN KEY (laptop_id) REFERENCES laptops(id)
    );
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      email TEXT PRIMARY KEY,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      payment_method TEXT,
      items TEXT,
      subtotal INTEGER,
      shipping INTEGER,
      tax INTEGER,
      total INTEGER,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      brand_model TEXT,
      service TEXT,
      details TEXT,
      created_at TEXT
    );
  `);

  const count = db.prepare('SELECT COUNT(1) as count FROM laptops').get().count;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO laptops (name, category, price, rating, reviews, specs, description, specs_full, features, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((items) => {
      for (const laptop of items) {
        insert.run(
          laptop.name,
          laptop.category,
          laptop.price,
          laptop.rating,
          laptop.reviews,
          laptop.specs,
          laptop.description,
          JSON.stringify(laptop.specsFull || {}),
          JSON.stringify(laptop.features || []),
          laptop.image
        );
      }
    });
    insertMany(LAPTOP_SEED);
  }
}

function formatLaptop(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    rating: row.rating,
    reviews: row.reviews,
    specs: row.specs,
    description: row.description,
    specsFull: row.specs_full ? JSON.parse(row.specs_full) : {},
    features: row.features ? JSON.parse(row.features) : [],
    image: row.image
  };
}

function getCartItems() {
  return db.prepare('SELECT laptop_id as id, qty FROM cart ORDER BY laptop_id').all();
}

function getFavourites() {
  return db.prepare('SELECT laptop_id FROM favourites ORDER BY laptop_id').all().map(r => r.laptop_id);
}

app.get('/api/laptops', (req, res) => {
  const rows = db.prepare('SELECT * FROM laptops ORDER BY id').all();
  res.json(rows.map(formatLaptop));
});

app.get('/api/laptops/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM laptops WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Laptop not found' });
  res.json(formatLaptop(row));
});

app.get('/api/cart', (req, res) => {
  res.json(getCartItems());
});

app.put('/api/cart', (req, res) => {
  if (!Array.isArray(req.body.items)) {
    return res.status(400).json({ error: 'Expected items array' });
  }
  const clear = db.prepare('DELETE FROM cart');
  const insert = db.prepare('INSERT OR REPLACE INTO cart (laptop_id, qty) VALUES (?, ?)');
  const transaction = db.transaction((items) => {
    clear.run();
    for (const item of items) {
      const qty = Math.max(0, parseInt(item.qty, 10) || 0);
      if (qty <= 0) continue;
      insert.run(item.id, qty);
    }
  });
  transaction(req.body.items);
  res.json(getCartItems());
});

app.get('/api/favourites', (req, res) => {
  res.json(getFavourites());
});

app.put('/api/favourites', (req, res) => {
  if (!Array.isArray(req.body.items)) {
    return res.status(400).json({ error: 'Expected items array' });
  }
  const clear = db.prepare('DELETE FROM favourites');
  const insert = db.prepare('INSERT OR IGNORE INTO favourites (laptop_id, created_at) VALUES (?, ?)');
  const transaction = db.transaction((items) => {
    clear.run();
    for (const id of items) {
      insert.run(id, new Date().toISOString());
    }
  });
  transaction(req.body.items);
  res.json(getFavourites());
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const stmt = db.prepare('INSERT OR IGNORE INTO newsletter_subscriptions (email, created_at) VALUES (?, ?)');
  stmt.run(email, new Date().toISOString());
  res.json({ success: true });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  const stmt = db.prepare('INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(name, email, phone || '', subject || '', message, new Date().toISOString());
  res.json({ success: true });
});

app.post('/api/services', (req, res) => {
  const { name, email, phone, brandModel, service, details } = req.body;
  if (!name || !email || !brandModel || !service || !details) {
    return res.status(400).json({ error: 'Name, email, laptop model, service, and description are required' });
  }
  const stmt = db.prepare('INSERT INTO service_requests (name, email, phone, brand_model, service, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(name, email, phone || '', brandModel, service, details, new Date().toISOString());
  res.json({ success: true });
});

app.post('/api/orders', (req, res) => {
  const { name, email, phone, address, paymentMethod, items = [] } = req.body;
  if (!name || !email || !address || items.length === 0) {
    return res.status(400).json({ error: 'Name, email, address and at least one cart item are required' });
  }
  const priceMap = new Map(db.prepare('SELECT id, price FROM laptops').all().map(r => [r.id, r.price]));
  let subtotal = 0;
  for (const item of items) {
    const price = priceMap.get(item.id) || 0;
    subtotal += price * (item.qty || 1);
  }
  const shipping = subtotal > 100000 ? 0 : 499;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  const stmt = db.prepare(`
    INSERT INTO orders (name, email, phone, address, payment_method, items, subtotal, shipping, tax, total, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const meta = stmt.run(
    name,
    email,
    phone || '',
    address,
    paymentMethod || '',
    JSON.stringify(items),
    subtotal,
    shipping,
    tax,
    total,
    new Date().toISOString()
  );
  db.prepare('DELETE FROM cart').run();
  res.json({ orderId: meta.lastInsertRowid, subtotal, shipping, tax, total });
});

app.get('/api/stats', (req, res) => {
  const laptopCount = db.prepare('SELECT COUNT(1) as count FROM laptops').get().count;
  const orders = db.prepare('SELECT COUNT(1) as count FROM orders').get().count;
  res.json({ laptops: laptopCount, orders });
});

initializeDatabase();

app.listen(PORT, () => {
  console.log(`LaptopHub API running on http://localhost:${PORT}`);
});
