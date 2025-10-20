require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const DB_FILE = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, withdraws: [] }, null, 2));
function readDB(){ return JSON.parse(fs.readFileSync(DB_FILE)); }
function writeDB(data){ fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const DOMAIN = process.env.DOMAIN || 'https://yourdomain.com';

const REWARD_PER_AD = 5; // টাকা per ad
const MIN_WITHDRAW = 1000; // টাকা

function getUserOrCreate(userId){
  const db = readDB();
  if (!db.users[userId]) db.users[userId] = { id: userId, balance: 0, referrals: 0, watchedAds: 0 };
  writeDB(db);
  return db.users[userId];
}

app.get('/api/user/:id', (req, res)=>{
  const userId = req.params.id;
  const db = readDB();
  if (!db.users[userId]) db.users[userId] = { id: userId, balance: 0, referrals: 0, watchedAds: 0 };
  writeDB(db);
  res.json(db.users[userId]);
});

app.post('/api/ad-complete', (req, res)=>{
  const { userId, token } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const db = readDB();
  if (!db.users[userId]) db.users[userId] = { id: userId, balance: 0, referrals: 0, watchedAds: 0 };
  db.users[userId].balance += REWARD_PER_AD;
  db.users[userId].watchedAds += 1;
  writeDB(db);
  return res.json({ ok: true, newBalance: db.users[userId].balance });
});

app.post('/api/withdraw', (req, res)=>{
  const { userId, method, account, amount } = req.body;
  if (!userId || !method || !account || !amount) return res.status(400).json({ error: 'missing fields' });
  const db = readDB();
  if (!db.users[userId]) return res.status(400).json({ error: 'user not found' });
  if (db.users[userId].balance < amount) return res.status(400).json({ error: 'insufficient balance' });
  if (amount < MIN_WITHDRAW) return res.status(400).json({ error: `minimum withdraw is ${MIN_WITHDRAW}` });
  db.users[userId].balance -= amount;
  db.withdraws.push({ id: Date.now(), userId, method, account, amount, status: 'pending', createdAt: new Date().toISOString() });
  writeDB(db);
  return res.json({ ok: true });
});

// Demo claim endpoint
app.post('/api/fake-claim', (req, res)=>{
  const { userId, amount } = req.body;
  const db = readDB();
  if (!db.users[userId]) db.users[userId] = { id: userId, balance: 0, referrals: 0, watchedAds: 0 };
  db.users[userId].balance += Number(amount || 0);
  writeDB(db);
  res.json({ ok: true });
});

app.get('/admin/withdraws', (req, res)=>{
  const pass = req.query.password || '';
  if (pass !== process.env.ADMIN_PASSWORD) return res.status(401).send('unauthorized');
  const db = readDB();
  res.json(db.withdraws);
});

app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=> console.log('Server running on port', PORT));
