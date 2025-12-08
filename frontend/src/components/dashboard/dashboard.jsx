import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const Dashboard = () => {
    const BASE_API_URL = "https://my-crm-backend-a5q4.onrender.com";
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const username = localStorage.getItem("username") || "User";
    const MONTHLY_TARGET = 1000000; // 10 Lakh Target

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
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

    if (loading) return <div style={{padding:'30px', color:'#fff', textAlign:'center', fontSize: '18px'}}>🚀 Loading Business Intelligence...</div>;
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

    // --- HELPER: FORMAT CURRENCY ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(amount);
    };

    // --- STYLES ---
    const s = {
        container: { padding: '20px', color: '#fff', minHeight: '80vh', fontFamily: "'Segoe UI', sans-serif" },
        welcomeText: { fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(90deg, #00ffcc, #00c3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '5px' },
        roleBadge: { fontSize:'12px', background:'#333', padding:'4px 10px', borderRadius:'12px', color:'#bbb', border:'1px solid #555', verticalAlign:'middle', marginLeft:'10px', textTransform: 'uppercase' },
        
        // Grid System
        mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
        
        // Cards
        card: { background: '#1a1a1a', padding: '25px', borderRadius: '15px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
        cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#fff', marginTop: '10px' },
        cardLabel: { color: '#888', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' },
        
        // Charts & Tables Sections
        splitSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', marginBottom: '30px' },
        contentBox: { background: '#1a1a1a', padding: '25px', borderRadius: '15px', border: '1px solid #333', height: '400px', display: 'flex', flexDirection: 'column' },
        
        // Table Styles
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
        th: { textAlign: 'left', color: '#888', padding: '10px', borderBottom: '1px solid #333', fontSize: '12px' },
        td: { padding: '12px 10px', borderBottom: '1px solid #222', color: '#ddd', fontSize: '14px' },
        
        // Leaderboard Row
        leaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#222', marginBottom: '8px', borderRadius: '8px', borderLeft: '4px solid #00ffcc' }
    };

    // Helper for Cards
    const StatCard = ({ label, val, color, icon, subtext }) => (
        <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={s.cardLabel}>{label}</span>
                <span style={{fontSize: '20px'}}>{icon}</span>
            </div>
            <span style={s.cardValue}>{val}</span>
            {subtext && <span style={{fontSize: '12px', color: color, marginTop: '5px'}}>{subtext}</span>}
        </div>
    );

    return (
        <div style={s.container}>
            <Toaster position="top-right" />
            
            {/* Header */}
            <div style={{ marginBottom: '30px', borderBottom:'1px solid #333', paddingBottom:'20px' }}>
                <div style={s.welcomeText}>
                    Welcome back, {username}! 👋 
                    <span style={s.roleBadge}>{stats.role_view} View</span>
                </div>
                <div style={{ color: '#888', marginTop: '5px' }}>Here is what's happening in your business today.</div>
            </div>

            {/* 🟢 SALES & MANAGER VIEW */}
            {(stats.role_view === 'Sales' || stats.role_view === 'Manager') && (
                <>
                    {/* 1. KEY METRICS CARDS */}
                    <div style={s.mainGrid}>
                        <StatCard 
                            label="Total Revenue" 
                            val={formatCurrency(stats.total_revenue || 0)} 
                            color="#00C49F" 
                            icon="💰" 
                            subtext={`${targetPercentage}% of Monthly Target`}
                        />
                        <StatCard label="Active Leads" val={stats.total_leads} color="#0088FE" icon="👥" />
                        <StatCard label="Calls Today" val={stats.todays_calls} color="#FFBB28" icon="📞" subtext="Urgent Follow-ups" />
                        <StatCard label="Deals Closed" val={stats.converted_leads} color="#FF8042" icon="✅" />
                    </div>

                    {/* 2. REVENUE TARGET BAR (Visual) */}
                    <div style={{ ...s.card, marginBottom: '30px', padding: '20px' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>🎯 Monthly Revenue Goal (₹10L)</span>
                            <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{targetPercentage}% Achieved</span>
                        </div>
                        <div style={{ width: '100%', background: '#333', borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
                            <div style={{ 
                                height: '100%', 
                                width: `${targetPercentage}%`, 
                                background: 'linear-gradient(90deg, #00ffcc, #00C49F)', 
                                transition: 'width 1s ease-in-out',
                                borderRadius: '10px'
                            }} />
                        </div>
                    </div>

                    {/* 3. CHARTS & LISTS AREA */}
                    <div style={s.splitSection}>
                        
                        {/* CHART: Lead Status */}
                        <div style={s.contentBox}>
                            <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '15px' }}>📊 Lead Conversion Ratio</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={leadData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {leadData.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #ffffffff", borderRadius:'8px', color: '#ffffffff' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 🏆 LEADERBOARD (Only for Manager) or RECENT SALES */}
                        <div style={s.contentBox}>
                            {stats.role_view === 'Manager' && stats.leaderboard ? (
                                <>
                                    <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '15px' }}>🏆 Top Performers</div>
                                    <div style={{ overflowY: 'auto' }}>
                                        {stats.leaderboard.map((user, index) => (
                                            <div key={index} style={s.leaderRow}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <span style={{fontSize: '20px'}}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index+1}`}</span>
                                                    <span style={{fontWeight: 'bold', color: '#fff'}}>{user.owner__username}</span>
                                                </div>
                                                <span style={{color: '#00ffcc', fontWeight: 'bold'}}>{formatCurrency(user.total_amount)}</span>
                                            </div>
                                        ))}
                                        {stats.leaderboard.length === 0 && <div style={{color: '#666', textAlign: 'center', marginTop: '50px'}}>No sales data yet.</div>}
                                    </div>
                                </>
                            ) : (
                                // SALES VIEW: TIPS
                                <>
                                    <div style={{ color: '#00ffcc', fontWeight: 'bold', marginBottom: '15px' }}>💡 Sales Strategy</div>
                                    <ul style={{ color: '#bbb', lineHeight: '1.8', fontSize: '14px' }}>
                                        <li>🚀 <strong>Focus on "Interested" Leads:</strong> You have {stats.interested_leads} leads waiting. Close them!</li>
                                        <li>📞 <strong>Follow-ups:</strong> Check your "Calls Today" list. Consistency is key.</li>
                                        <li>💰 <strong>Upsell:</strong> Existing converted clients might need new services.</li>
                                    </ul>
                                </>
                            )}
                        </div>

                    </div>

                    {/* 4. RECENT TRANSACTIONS TABLE (New Feature) */}
                    <div style={{ ...s.contentBox, height: 'auto', minHeight: '300px' }}>
                        <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '10px' }}>🕒 Recent Transactions</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={s.table}>
                                <thead>
                                    <tr>
                                        <th style={s.th}>COMPANY</th>
                                        <th style={s.th}>AMOUNT</th>
                                        <th style={s.th}>DATE</th>
                                        <th style={s.th}>CLOSED BY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_payments && stats.recent_payments.length > 0 ? (
                                        stats.recent_payments.map((p, i) => (
                                            <tr key={i}>
                                                <td style={{...s.td, color: '#fff', fontWeight: 'bold'}}>{p.company}</td>
                                                <td style={{...s.td, color: '#00ffcc'}}>{formatCurrency(p.amount)}</td>
                                                <td style={s.td}>{p.date}</td>
                                                <td style={s.td}>
                                                    <span style={{background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>{p.by}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" style={{...s.td, textAlign: 'center', color: '#555'}}>No recent transactions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* 🔴 TECH & MANAGER VIEW */}
            {(stats.role_view === 'Tech' || stats.role_view === 'Manager') && (
                <>
                    {stats.role_view === 'Manager' && <h3 style={{color:'#fff', borderTop:'1px solid #333', paddingTop:'30px', marginTop:'30px'}}>Technical Overview</h3>}
                    
                    <div style={s.mainGrid}>
                        <StatCard label="Pending Tasks" val={stats.pending_tasks} color="#FFBB28" icon="⏳" />
                        <StatCard label="High Priority" val={stats.high_priority_tasks} color="#FF4444" icon="🔥" subtext="Needs Attention" />
                        <StatCard label="Active Tenders" val={stats.active_tenders} color="#0088FE" icon="📜" />
                        <StatCard label="Service Due" val={stats.service_due} color="#FF8042" icon="🛠️" />
                    </div>

                    {/* Tech Placeholder for future charts */}
                    {stats.role_view === 'Tech' && (
                        <div style={{textAlign:'center', padding:'40px', background:'#1a1a1a', borderRadius:'15px', color:'#666', border: '1px solid #333'}}>
                            <div style={{fontSize:'50px', marginBottom: '10px'}}>👨‍💻</div>
                            <div style={{fontSize: '18px', color: '#fff'}}>System is Operational</div>
                            <div>Please check Task Manager for detailed work orders.</div>
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default Dashboard;