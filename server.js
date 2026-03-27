const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new Database('portfolio.db');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));  // serves your index.html

// Create table on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    url TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET all projects
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })));
});

// POST new project
app.post('/api/projects', (req, res) => {
  const { title, description, image, url, tags } = req.body;
  const result = db.prepare(
    'INSERT INTO projects (title, description, image, url, tags) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, image, url, JSON.stringify(tags || []));
  res.json({ id: result.lastInsertRowid });
});

// PUT update project
app.put('/api/projects/:id', (req, res) => {
  const { title, description, image, url, tags } = req.body;
  db.prepare(
    'UPDATE projects SET title=?, description=?, image=?, url=?, tags=? WHERE id=?'
  ).run(title, description, image, url, JSON.stringify(tags || []), req.params.id);
  res.json({ success: true });
});

// DELETE project
app.delete('/api/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));