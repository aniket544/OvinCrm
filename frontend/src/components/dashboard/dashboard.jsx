import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {

    const [stats, setStats] = useState({
        totalLeads: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        pendingTasks: 0,
        leadsData: [],
        revenueData: [],
        todaysCalls: [],
        expiringTenders: [],
        topClients: []
    });

    const username = localStorage.getItem("username") || "Admin";
    const MONTHLY_TARGET = 1000000;

    const API_URLS = {
        leads: 'https://my-crm-backend.onrender.com',
        customers: 'https://my-crm-backend.onrender.com',
        payments: 'https://my-crm-backend.onrender.com',
        tasks: 'https://my-crm-backend.onrender.com',
        tenders: 'https://my-crm-backend.onrender.com'
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leads, customers, payments, tasks, tenders] = await Promise.all([
                    axios.get(API_URLS.leads, getAuthHeaders()),
                    axios.get(API_URLS.customers, getAuthHeaders()),
                    axios.get(API_URLS.payments, getAuthHeaders()),
                    axios.get(API_URLS.tasks, getAuthHeaders()),
                    axios.get(API_URLS.tenders, getAuthHeaders())
                ]);

                const leadsData = leads.data;
                const paymentsData = payments.data;
                const tasksData = tasks.data;
                const tendersData = tenders.data;

                const today = new Date().toISOString().split('T')[0];
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const nextWeekStr = nextWeek.toISOString().split('T')[0];

                const totalRevenue = paymentsData.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const pendingTasks = tasksData.filter(t => t.status === 'Pending').length;

                // PIE chart data
                const pieData = [
                    { name: "New", value: leadsData.filter(l => l.status === "New").length },
                    { name: "Converted", value: leadsData.filter(l => l.status === "Converted").length },
                    { name: "Closed", value: leadsData.filter(l => l.status === "Closed").length }
                ];

                // Calls Today
                const todaysCalls = tasksData.filter(t => t.next_follow_up === today && t.status !== 'Done');

                // Expiring Tenders
                const expiringTenders = tendersData.filter(t => t.end_date >= today && t.end_date <= nextWeekStr);

                // Top clients
                const revenueMap = paymentsData.reduce((acc, p) => {
                    acc[p.company] = (acc[p.company] || 0) + Number(p.amount);
                    return acc;
                }, {});

                const topClients = Object.keys(revenueMap)
                    .map(c => ({ company: c, totalAmount: revenueMap[c] }))
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .slice(0, 3);

                setStats({
                    totalLeads: leadsData.length,
                    totalCustomers: customers.data.length,
                    totalRevenue,
                    pendingTasks,
                    leadsData: pieData,
                    revenueData: paymentsData.slice(0, 5),
                    todaysCalls,
                    expiringTenders,
                    topClients
                });

            } catch (error) {
                console.error("Dashboard Load Error:", error.message);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
    const targetPercentage = Math.min((stats.totalRevenue / MONTHLY_TARGET) * 100, 100).toFixed(1);

    const styles = {
        container: { padding: '20px', color: '#fff' },
        welcomeText: {
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #00ffcc, #00c3ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        cardGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        card: {
            background: '#1e1e1e',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid #333',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        listBox: {
            background: '#1e1e1e',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid #333',
            height: '350px',
            overflowY: 'auto'
        },
        splitSection: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        listItem: {
            background: '#252525',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }
    };

    return (
        <div style={styles.container}>
            
            {/* Welcome */}
            <div style={{ marginBottom: '25px' }}>
                <div style={styles.welcomeText}>Hello, {username}! 👋</div>
                <div style={{ color: '#888' }}>Here's your daily overview.</div>
            </div>

            {/* Target Meter */}
            <div style={{ ...styles.card, marginBottom: '30px', alignItems: "flex-start", borderLeft: '5px solid #ff00cc' }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🎯 Monthly Revenue Target (₹10 Lakh)</span>
                    <span style={{ fontSize: '18px', color: '#ff00cc' }}>{targetPercentage}%</span>
                </div>

                <div style={{ width: '100%', background: '#333', borderRadius: '10px', height: '15px', marginTop: '10px' }}>
                    <div style={{ height: '100%', width: `${targetPercentage}%`, background: 'linear-gradient(90deg, #ff00cc, #333399)' }} />
                </div>

                <div style={{ fontSize: '12px', color: '#bbb', marginTop: '5px' }}>
                    Current: ₹{stats.totalRevenue.toLocaleString()} / ₹10,00,000
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.cardGrid}>
                <div style={{ ...styles.card, borderBottom: '4px solid #0088FE' }}>
                    <span>Total Leads</span>
                    <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalLeads}</span>
                </div>

                <div style={{ ...styles.card, borderBottom: '4px solid #00C49F' }}>
                    <span>Revenue</span>
                    <span style={{ fontSize: '32px', fontWeight: 'bold' }}>₹{stats.totalRevenue.toLocaleString()}</span>
                </div>

                <div style={{ ...styles.card, borderBottom: '4px solid #FFBB28' }}>
                    <span>Pending Tasks</span>
                    <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.pendingTasks}</span>
                </div>

                <div style={{ ...styles.card, borderBottom: '4px solid #FF8042' }}>
                    <span>Urgent Tenders</span>
                    <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.expiringTenders.length}</span>
                </div>
            </div>


            {/* Calls & Tenders */}
            <div style={styles.splitSection}>
                {/* Calls Today */}
                <div style={styles.listBox}>
                    <div style={{ marginBottom: '10px', color: '#ff00cc', fontWeight: 'bold' }}>📞 Calls Today</div>

                    {stats.todaysCalls.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>No calls scheduled 🎉</div>
                    ) : (
                        stats.todaysCalls.map(t => (
                            <div key={t.id} style={{ ...styles.listItem, borderLeft: '4px solid #ff00cc' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{t.lead_name}</div>
                                    <div style={{ fontSize: '12px', color: '#bbb' }}>{t.company} • {t.contact}</div>
                                </div>
                                <button style={{ background: 'transparent', border: '1px solid #ff00cc', color: '#ff00cc', borderRadius: '5px' }}>Call</button>
                            </div>
                        ))
                    )}
                </div>

                {/* Expiring Tenders */}
                <div style={styles.listBox}>
                    <div style={{ marginBottom: '10px', color: '#ff4444', fontWeight: 'bold' }}>🚨 Expiring Tenders</div>

                    {stats.expiringTenders.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>No urgent deadlines</div>
                    ) : (
                        stats.expiringTenders.map(t => (
                            <div key={t.id} style={{ ...styles.listItem, borderLeft: '4px solid #ff4444' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{t.company}</div>
                                    <div style={{ fontSize: '12px', color: '#ff4444' }}>Exp: {t.end_date}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#bbb' }}>{t.bid_no}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>


            {/* Leaderboard + Pie Chart */}
            <div style={styles.splitSection}>

                {/* Leaderboard */}
                <div style={styles.listBox}>
                    <div style={{ marginBottom: '10px', color: '#FFBB28', fontWeight: 'bold' }}>🏆 Top Clients</div>
                    {stats.topClients.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>No payments yet</div>
                    ) : (
                        stats.topClients.map((c, idx) => (
                            <div key={c.company} style={{ ...styles.listItem, borderLeft: '4px solid #FFBB28' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '20px', marginRight: '10px' }}>
                                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{c.company}</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#00C49F' }}>₹{c.totalAmount.toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pie Chart */}
                <div style={{ ...styles.listBox, height: '350px' }}>
                    <div style={{ marginBottom: '10px', color: '#0088FE', fontWeight: 'bold' }}>Lead Status Breakdown</div>

                    {/* 🔥 FIXED HEIGHT to Prevent Chart Error */}
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={stats.leadsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.leadsData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
