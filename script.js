document.addEventListener('DOMContentLoaded', () => {
    console.log('Impact Dashboard Initializing...');

    // Utility: Safe add event listener
    const on = (id, event, callback) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, callback);
        } else {
            console.warn(`Element with id "${id}" not found. skipping listener.`);
        }
    };

    /* =========================================================================
       1. Navigation Logic (SPA feel)
       ========================================================================= */
    const setupNavigation = () => {
        const navItems = document.querySelectorAll('.nav-item');
        const views = document.querySelectorAll('.view');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                if (!target) return;

                const targetView = document.getElementById(`view-${target}`);
                if (!targetView) {
                    console.error(`View "view-${target}" not found.`);
                    return;
                }

                // Update active navigation
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update active view
                views.forEach(v => v.classList.remove('active'));
                targetView.classList.add('active');
                
                // Re-render charts
                window.dispatchEvent(new Event('resize'));
            });
        });
    };

    /* =========================================================================
       2. Interaction Logic (Modals & Buttons)
       ========================================================================= */
    const setupInteractions = () => {
        // New Task Modal
        const modal = document.getElementById('modal-new-task');
        on('btn-new-task', 'click', () => {
            if (modal) modal.classList.add('active');
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                if (modal) modal.classList.remove('active');
            });
        });

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }

        // Form Submission
        const form = document.getElementById('form-new-task');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const taskData = {
                    title: formData.get('title'),
                    org: formData.get('org'),
                    status: formData.get('status'),
                    urgency: formData.get('urgency')
                };

                try {
                    const res = await fetch('/api/opportunities', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(taskData)
                    });

                    if (res.ok) {
                        await loadOpportunities();
                        if (modal) modal.classList.remove('active');
                        form.reset();
                    } else {
                        alert("Submission failed. Check server status.");
                    }
                } catch (err) {
                    console.error("Form submission error:", err);
                    alert("Connection error. Is the server running?");
                }
            });
        }

        // Header Action Placeholders
        on('btn-notifications', 'click', () => {
            alert("Latest Notifications:\n1. 'Clean Beach Drive' is 90% full.\n2. New volunteer sign-up: Marcus T.\n3. Opportunity 'Food Bank Sort' completed.");
        });

        on('btn-settings', 'click', () => {
            alert("Settings:\n- Theme: Dark Mode (Default)\n- Sync Status: Online\n- Version: 1.0.4");
        });
    };

    /* =========================================================================
       3. Data Persistence & Charts
       ========================================================================= */
    const API_BASE = '/api';

    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.warn(`Fetch failed for ${endpoint}:`, error);
            return null;
        }
    }

    async function loadVolunteers() {
        const container = document.getElementById('volunteers-container');
        if (!container) return;

        const data = await fetchData('/volunteers');
        if (!data) return;
        
        container.innerHTML = data.map(v => `
            <div class="volunteer-card glass border-all">
                <img src="https://i.pravatar.cc/150?img=${v.img}" alt="${v.name}" class="vol-avatar">
                <h3 class="vol-name">${v.name}</h3>
                <p class="vol-role">${v.role}</p>
                <div class="skills-tags">${v.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
                <div class="vol-stats">
                    <div class="stat"><div class="stat-val">${v.hours}</div><div class="stat-lbl">Hours</div></div>
                    <div class="stat"><div class="stat-val">${v.tasks}</div><div class="stat-lbl">Tasks</div></div>
                </div>
            </div>
        `).join('');
    }

    async function loadOpportunities() {
        const data = await fetchData('/opportunities');
        if (!data) return;

        const containers = {
            open: document.getElementById('tasks-open'),
            progress: document.getElementById('tasks-progress'),
            completed: document.getElementById('tasks-completed')
        };

        // Clear containers safely
        Object.keys(containers).forEach(key => {
            if (containers[key]) containers[key].innerHTML = '';
        });

        data.forEach(opt => {
            const card = `
                <div class="task-card border-all glass">
                    <h4 class="task-title">${opt.title}</h4>
                    <p class="task-org">${opt.org}</p>
                    <div class="task-meta">
                        <span class="task-tag ${opt.urgency === 'urgent' ? 'tag-urgent' : 'tag-normal'}">${opt.urgency === 'urgent' ? 'Urgent' : 'Standard'}</span>
                        <button class="icon-btn" style="width:24px;height:24px;font-size:12px;"><i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
            `;
            if (containers[opt.status]) {
                containers[opt.status].innerHTML += card;
            }
        });
    }

    async function loadCampaigns() {
        const container = document.getElementById('campaigns-container');
        if (!container) return;

        const data = await fetchData('/campaigns');
        if (!data) return;

        container.innerHTML = data.map(c => `
            <div class="campaign-card glass border-all">
                <img src="${c.img}" alt="${c.title}" class="camp-img">
                <div class="camp-info">
                    <h3>${c.title}</h3>
                    <p>${c.desc}</p>
                    <div class="progress-container">
                        <div class="progress-header"><span>${c.current} / ${c.goal}</span><span>${c.progress}%</span></div>
                        <div class="progress-bar-bg"><div class="progress-fill" style="width: ${c.progress}%"></div></div>
                    </div>
                </div>
                <div class="camp-actions"><button class="primary-btn" style="padding: 8px 16px; font-size:13px;">Manage</button></div>
            </div>
        `).join('');
    }

    async function initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded. Skipping chart initialization.');
            return;
        }

        try {
            Chart.defaults.color = '#94a3b8';
            Chart.defaults.font.family = "'Outfit', sans-serif";
            
            // Dashboard Line
            const dashCanvas = document.getElementById('dashboardChart');
            if (dashCanvas) {
                const ctx = dashCanvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        datasets: [{
                            label: 'Hours', data: [650, 780, 720, 950, 1100, 1050, 1340],
                            borderColor: '#8b5cf6', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                });
            }

            // Impact Doughnut
            const impactCanvas = document.getElementById('impactDoughnut');
            if (impactCanvas) {
                fetchData('/impact').then(impactData => {
                    if (impactData) {
                        new Chart(impactCanvas.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: ['Environment', 'Education', 'Health', 'Poverty'],
                                datasets: [{
                                    data: [impactData.environment_pct, impactData.education_pct, impactData.health_pct, impactData.poverty_pct],
                                    backgroundColor: ['#10b981', '#0ea5e9', '#f43f5e', '#f59e0b'], borderWidth: 0
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
                        });
                    }
                });
            }

            // Impact Bar
            const barCanvas = document.getElementById('impactBarChart');
            if (barCanvas) {
                new Chart(barCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['2023', '2024', '2025', '2026'],
                        datasets: [
                            { label: 'Volunteers', data: [800, 1200, 1500, 950], backgroundColor: '#8b5cf6' },
                            { label: 'Projects', data: [45, 80, 110, 65], backgroundColor: '#0ea5e9' }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        } catch (err) {
            console.warn('Charts failed to initialize:', err);
        }
    }

    // Run Engine
    try {
        setupNavigation();
        setupInteractions();
        
        // Load dynamic parts
        loadVolunteers();
        loadOpportunities();
        loadCampaigns();
        initCharts();

    } catch (err) {
        console.error('Critical Dashboard Error:', err);
    }

});
