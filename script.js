// Mock Data for the Volunteers Table
const recentVolunteers = [
    {
        name: "Alex Turner",
        email: "alex.t@example.com",
        avatar: "https://i.pravatar.cc/150?img=11",
        event: "River Cleanup Drive",
        skills: ["Manual Labor", "First Aid"],
        status: "Active"
    },
    {
        name: "Maria Garcia",
        email: "m.garcia@example.com",
        avatar: "https://i.pravatar.cc/150?img=5",
        event: "Code for Good Mentorship",
        skills: ["Python", "Teaching"],
        status: "Active"
    },
    {
        name: "James Wilson",
        email: "j.wilson99@example.com",
        avatar: "https://i.pravatar.cc/150?img=12",
        event: "Food Bank Organization",
        skills: ["Logistics", "Driving"],
        status: "Pending"
    },
    {
        name: "Emily Chen",
        email: "emily.c@example.com",
        avatar: "https://i.pravatar.cc/150?img=20",
        event: "Senior Center Tech Support",
        skills: ["IT Support", "Patience"],
        status: "Active"
    }
];

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Table Data
    const tableBody = document.getElementById('volunteer-table-body');
    
    recentVolunteers.forEach(vol => {
        let skillsHtml = vol.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        let statusClass = vol.status === 'Active' ? 'status-active' : 'status-pending';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="volunteer-cell">
                    <img src="${vol.avatar}" alt="${vol.name}" class="volunteer-avatar">
                    <div>
                        <span class="volunteer-name">${vol.name}</span>
                        <span class="volunteer-email">${vol.email}</span>
                    </div>
                </div>
            </td>
            <td><div style="font-size: 14px; font-weight: 500">${vol.event}</div></td>
            <td>
                <div class="skills-tags">
                    ${skillsHtml}
                </div>
            </td>
            <td><span class="status-badge ${statusClass}">${vol.status}</span></td>
        `;
        tableBody.appendChild(tr);
    });

    // Chart.js Default Configs
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';
    
    // Engagement Chart (Line Chart)
    const ctxEngagement = document.getElementById('engagementChart').getContext('2d');
    
    const gradientLightBlue = ctxEngagement.createLinearGradient(0, 0, 0, 400);
    gradientLightBlue.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradientLightBlue.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    new Chart(ctxEngagement, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Volunteer Hours',
                data: [650, 780, 820, 950, 1100, 1250, 1400],
                borderColor: '#2563eb',
                backgroundColor: gradientLightBlue,
                borderWidth: 3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 14, weight: 'bold' },
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9',
                        drawBorder: false
                    },
                    ticks: {
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        padding: 10
                    }
                }
            }
        }
    });

    // Impact Chart (Doughnut Chart)
    const ctxImpact = document.getElementById('impactChart').getContext('2d');
    new Chart(ctxImpact, {
        type: 'doughnut',
        data: {
            labels: ['Education', 'Environment', 'Health', 'Community'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    '#2563eb', // blue
                    '#10b981', // green
                    '#f59e0b', // yellow/orange
                    '#8b5cf6'  // purple
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
});
