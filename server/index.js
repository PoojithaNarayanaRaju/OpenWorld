import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'));
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend dev server
  credentials: true
}));
app.use(express.json());

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      stars INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Add some sample projects if none exist
  db.get('SELECT COUNT(*) as count FROM projects', [], (err, result) => {
    if (!err && result.count === 0) {
      const sampleProjects = [
        {
          user_id: 1,
          title: 'AI Code Assistant',
          description: 'An intelligent coding assistant powered by machine learning',
          tags: JSON.stringify(['AI', 'Machine Learning', 'TypeScript']),
          stars: 42
        },
        {
          user_id: 1,
          title: 'Quantum Computing Simulator',
          description: 'A web-based quantum circuit simulator for educational purposes',
          tags: JSON.stringify(['Quantum', 'Education', 'WebAssembly']),
          stars: 28
        }
      ];

      sampleProjects.forEach(project => {
        db.run(
          'INSERT INTO projects (user_id, title, description, tags, stars) VALUES (?, ?, ?, ?, ?)',
          [project.user_id, project.title, project.description, project.tags, project.stars]
        );
      });
    }
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error during login' });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token });
  });
});

// Project routes
app.get('/api/projects', (req, res) => {
  db.all(`
    SELECT 
      p.*,
      COALESCE(u.email, 'anonymous') as creator_email,
      (SELECT COUNT(*) FROM users) as contributors
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `, [], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching projects' });
    }
    
    // Parse tags from string to array
    const formattedProjects = projects.map(project => ({
      ...project,
      tags: project.tags ? JSON.parse(project.tags) : []
    }));

    res.json(formattedProjects);
  });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { title, description, tags } = req.body;
  
  db.run(
    'INSERT INTO projects (user_id, title, description, tags) VALUES (?, ?, ?, ?)',
    [req.user.id, title, description, JSON.stringify(tags)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating project' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Project created successfully'
      });
    }
  );
});

// Star a project
app.post('/api/projects/:id/star', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE projects SET stars = stars + 1 WHERE id = ?',
    [id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error starring project' });
      }
      res.json({ message: 'Project starred successfully' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});