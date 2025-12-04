import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis 
} from 'recharts';

const Dashboard = () => {
    const BASE_API_URL = "https://my-crm-backend-a5q4.onrender.com";
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const username = localStorage.getItem("username") || "User";
    const MONTHLY_TARGET = 1000000;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 👇 Nayi Smart API Call
                const res = await axios.get(`${BASE_API_URL}/api/dashboard/stats/`, getAuthHeaders());
                setStats(res.data);
            } catch (error) {
                console.error("Dashboard Error:", error);
                toast.error("Failed to load dashboard stats.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{padding:'30px', color:'#fff', textAlign:'center'}}>Loading Dashboard... 🚀</div>;
    if (!stats) return <div style={{padding:'30px', color:'#fff', textAlign:'center'}}>No Data Available</div>;

    // --- CHART DATA PREP ---
    const leadData = [
        { name: "New", value: stats.new_leads || 0 },
        { name: "Interested", value: stats.interested_leads || 0 },
        { name: "Converted", value: stats.converted_leads || 0 }
    ];
    const COLORS = ['#0088FE', '#FFBB28', '#00C49F'];
    
    const targetPercentage = stats.total_revenue 
        ? Math.min((stats.total_revenue / MONTHLY_TARGET) * 100, 100).toFixed(1)
        : 0;

    // --- STYLES ---
    const s = {
        container: { padding: '20px', color: '#fff', minHeight: '80vh' },
        welcomeText: { fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(90deg, #00ffcc, #00c3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '5px' },
        roleBadge: { fontSize:'14px', background:'#333', padding:'4px 10px', borderRadius:'12px', color:'#bbb', border:'1px solid #555', verticalAlign:'middle', marginLeft:'10px' },
        cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
        card: { background: '#1e1e1e', padding: '20px', borderRadius: '15px', border: '1px solid #333', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        listBox: { background: '#1e1e1e', padding: '20px', borderRadius: '15px', border: '1px solid #333', height: '350px', overflowY: 'auto' },
        chartBox: { background: '#1e1e1e', padding: '20px', borderRadius: '15px', border: '1px solid #333', height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
        splitSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }
    };

    // Helper for Cards
    const StatCard = ({ label, val, color, icon }) => (
        <div style={{ ...s.card, borderBottom: `4px solid ${color}` }}>
            <span style={{color:'#bbb', marginBottom:'5px'}}>{icon} {label}</span>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color:'#fff' }}>{val}</span>
        </div>
    );

    return (
        <div style={s.container}>
            <Toaster />
            
            {/* Welcome Header */}
            <div style={{ marginBottom: '25px', borderBottom:'1px solid #333', paddingBottom:'20px' }}>
                <div style={s.welcomeText}>
                    Hello, {username}! 
                    <span style={s.roleBadge}>{stats.role_view} Dashboard</span>
                </div>
                <div style={{ color: '#888' }}>Here's your daily overview.</div>
            </div>

            {/* 🟢 SALES & MANAGER VIEW (Revenue & Leads) */}
            {(stats.role_view === 'Sales' || stats.role_view === 'Manager') && (
                <>
                    {/* Target Meter */}
                    <div style={{ ...s.card, marginBottom: '30px', alignItems: "flex-start", borderLeft: '5px solid #ff00cc', borderBottom:'none' }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🎯 Revenue Target (₹10L)</span>
                            <span style={{ fontSize: '18px', color: '#ff00cc' }}>{targetPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', background: '#333', borderRadius: '10px', height: '15px', marginTop: '10px' }}>
                            <div style={{ height: '100%', width: `${targetPercentage}%`, background: 'linear-gradient(90deg, #ff00cc, #333399)', borderRadius:'10px' }} />
                        </div>
                        <div style={{ fontSize: '12px', color: '#bbb', marginTop: '5px' }}>
                            Current: ₹{(stats.total_revenue || 0).toLocaleString()}
                        </div>
                    </div>

                    <div style={s.cardGrid}>
                        <StatCard label="Total Leads" val={stats.total_leads} color="#0088FE" icon="👥" />
                        <StatCard label="Revenue" val={`₹${(stats.total_revenue || 0).toLocaleString()}`} color="#00C49F" icon="💰" />
                        <StatCard label="Calls Today" val={stats.todays_calls} color="#FFBB28" icon="📞" />
                        <StatCard label="Converted" val={stats.converted_leads} color="#FF8042" icon="✅" />
                    </div>

                    <div style={s.splitSection}>
                        {/* Pie Chart */}
                        <div style={s.chartBox}>
                            <div style={{ marginBottom: '10px', color: '#0088FE', fontWeight: 'bold', textAlign:'center' }}>Lead Status Breakdown</div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={leadData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {leadData.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#333", border: "none", borderRadius:'5px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Quick Info / Motivation */}
                        <div style={s.listBox}>
                            <div style={{color:'#00ffcc', fontWeight:'bold', marginBottom:'10px'}}>💡 Sales Tips</div>
                            <ul style={{color:'#bbb', fontSize:'14px', lineHeight:'1.6'}}>
                                <li>• Follow up on "Interested" leads today.</li>
                                <li>• Update payment status for converted clients.</li>
                                <li>• Check "Calls Today" list in Sales Task Manager.</li>
                            </ul>
                        </div>
                    </div>
                </>
            )}

            {/* 🔴 TECH & MANAGER VIEW (Tasks & Tenders) */}
            {(stats.role_view === 'Tech' || stats.role_view === 'Manager') && (
                <>
                    {stats.role_view === 'Manager' && <h3 style={{color:'#fff', borderTop:'1px solid #333', paddingTop:'20px', marginTop:'20px'}}>Technical Overview</h3>}
                    
                    <div style={s.cardGrid}>
                        <StatCard label="Pending Tasks" val={stats.pending_tasks} color="#FFBB28" icon="⏳" />
                        <StatCard label="High Priority" val={stats.high_priority_tasks} color="#FF4444" icon="🔥" />
                        <StatCard label="Active Tenders" val={stats.active_tenders} color="#0088FE" icon="📜" />
                        <StatCard label="Service Due" val={stats.service_due} color="#FF8042" icon="🛠️" />
                    </div>

                    {/* Tech specific placeholder */}
                    {stats.role_view === 'Tech' && (
                        <div style={{textAlign:'center', padding:'40px', background:'#1e1e1e', borderRadius:'15px', color:'#666'}}>
                            <div style={{fontSize:'40px'}}>👨‍💻</div>
                            <div>Check Task Manager for details.</div>
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default Dashboard;