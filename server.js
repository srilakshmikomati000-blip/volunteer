const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database'); // Imports our DB and runs setup

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (this makes the Express server act as the web host for index.html)
app.use(express.static(path.join(__dirname, ''))); 

// ==========================================
// REST API ROUTES
// ==========================================

// Get all volunteers
app.get('/api/volunteers', (req, res) => {
    db.all("SELECT * FROM volunteers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Parse the skills string back into an array for the frontend
        const mappedRows = rows.map(r => ({
            ...r,
            skills: r.skills ? r.skills.split(', ') : []
        }));
        res.json(mappedRows);
    });
});

// Get all opportunities (tasks)
app.get('/api/opportunities', (req, res) => {
    db.all("SELECT * FROM opportunities", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new opportunity
app.post('/api/opportunities', (req, res) => {
    const { title, org, status, urgency } = req.body;
    if (!title || !org || !status || !urgency) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const query = `INSERT INTO opportunities (title, org, status, urgency) VALUES (?, ?, ?, ?)`;
    db.run(query, [title, org, status, urgency], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Task created successfully" });
    });
});

// Get all campaigns
app.get('/api/campaigns', (req, res) => {
    db.all("SELECT * FROM campaigns", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get impact data
app.get('/api/impact', (req, res) => {
    db.get("SELECT * FROM impact WHERE category = 'doughnut_data'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if(!row) return res.json({});
        res.json(row);
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
