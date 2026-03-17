const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite DB (this will create it if it doesn't exist)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Volunteers Table
        db.run(`CREATE TABLE IF NOT EXISTS volunteers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            role TEXT,
            img TEXT,
            skills TEXT,
            hours INTEGER,
            tasks INTEGER
        )`);

        // Create Opportunities Table
        db.run(`CREATE TABLE IF NOT EXISTS opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            org TEXT,
            status TEXT,    -- 'open', 'progress', 'completed'
            urgency TEXT    -- 'urgent', 'normal'
        )`);

        // Create Campaigns Table
        db.run(`CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            desc TEXT,
            progress INTEGER,
            goal TEXT,
            current TEXT,
            img TEXT
        )`);

        // Create Impact Table (For Chart data)
        db.run(`CREATE TABLE IF NOT EXISTS impact (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            environment_pct INTEGER,
            education_pct INTEGER,
            health_pct INTEGER,
            poverty_pct INTEGER
        )`);

        // Seed initial data if tables are empty
        seedData();
    });
}

function seedData() {
    db.get("SELECT COUNT(*) as count FROM volunteers", (err, row) => {
        if (row.count === 0) {
            console.log("Seeding Database...");
            
            const insertVol = db.prepare("INSERT INTO volunteers (name, role, img, skills, hours, tasks) VALUES (?, ?, ?, ?, ?, ?)");
            insertVol.run('Michael Chen', 'Medical Specialist', '11', 'First Aid, CPR, Logistics', 142, 18);
            insertVol.run('Aisha Patel', 'Community Outreach', '25', 'Translation, Education', 85, 12);
            insertVol.run('David Smith', 'Relief Driver', '33', 'Driving, Heavy Lifting', 210, 45);
            insertVol.run('Sarah Jenkins', 'Event Coordinator', '32', 'Planning, Public Speaking', 320, 60);
            insertVol.run('James Doe', 'General Volunteer', '55', 'Packing, Inventory', 45, 8);
            insertVol.run('Elena Rodriguez', 'Tech Support', '44', 'IT, Data Entry', 90, 15);
            insertVol.finalize();

            const insertOpp = db.prepare("INSERT INTO opportunities (title, org, status, urgency) VALUES (?, ?, ?, ?)");
            insertOpp.run('Emergency Supply Sort', 'Red Cross', 'open', 'urgent');
            insertOpp.run('Website Redesign', 'Local Shelter', 'open', 'normal');
            insertOpp.run('Weekend Food Drive', 'Community Kitchen', 'open', 'urgent');
            insertOpp.run('Data Entry', 'Wildlife Fund', 'open', 'normal');
            
            insertOpp.run('Setup Medical Tents', 'Doctors W/O Borders', 'progress', 'urgent');
            insertOpp.run('After School Tutoring', 'City Schools', 'progress', 'normal');
            insertOpp.run('Logistics Planning', 'Hope Foundation', 'progress', 'normal');
            
            insertOpp.run('Park Cleanup', 'Green Earth', 'completed', 'normal');
            insertOpp.run('Fundraiser Gala Repo', 'Charity Water', 'completed', 'normal');
            insertOpp.finalize();

            const insertCamp = db.prepare("INSERT INTO campaigns (title, desc, progress, goal, current, img) VALUES (?, ?, ?, ?, ?, ?)");
            insertCamp.run('Global Reforestation Initiative', 'Planting 10,000 trees in deforested areas across 5 regions.', 75, '10,000 Trees', '7,500', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=200&fit=crop');
            insertCamp.run('Winter Coat Drive 2026', 'Collecting warm clothing for the homeless population downtown.', 40, '500 Coats', '200', 'https://images.unsplash.com/photo-1517554907727-2e65de2d89ae?w=300&h=200&fit=crop');
            insertCamp.run('Clean Water Wells Project', 'Building sustainable water wells for rural communities.', 90, '$50,000', '$45,000', 'https://images.unsplash.com/photo-1538300263650-8b09a63ffb0c?w=300&h=200&fit=crop');
            insertCamp.finalize();

            const insertImpact = db.prepare("INSERT INTO impact (category, environment_pct, education_pct, health_pct, poverty_pct) VALUES (?, ?, ?, ?, ?)");
            insertImpact.run('doughnut_data', 35, 25, 20, 20);
            insertImpact.finalize();
            
            console.log("Database DB Seeding Complete!");
        }
    });
}

module.exports = db;
