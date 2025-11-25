import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState(null);

    // --- STYLES ---
    const styles = {
        sidebar: {
            width: '320px',
            height: '100vh',
            background: 'linear-gradient(180deg, #111111 0%, #1a1a1a 100%)',
            color: '#fff',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 15px rgba(0,0,0,0.6)',
            zIndex: 1000,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            transition: 'all 0.3s ease'
        },
        logoContainer: {
            padding: '30px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #333',
            background: 'rgba(0,0,0,0.2)'
        },
        logoTextCRM: {
            fontSize: '32px',
            fontWeight: '900',
            color: '#fff',
            letterSpacing: '2px',
            lineHeight: '1'
        },
        logoTextPowered: {
            fontSize: '12px',
            color: '#888',
            fontStyle: 'italic',
            margin: '5px 0'
        },
        logoTextOVIN: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00ffcc',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            textShadow: '0 0 8px rgba(0, 255, 204, 0.4)'
        },
        menuContainer: {
            flexGrow: 1,
            paddingTop: '20px',
            overflowY: 'auto'
        }
    };

    return (
        <div style={styles.sidebar}>
            {/* HEADER / LOGO */}
            <div style={styles.logoContainer}>
                <div style={styles.logoTextCRM}>CRM</div>
                <div style={styles.logoTextPowered}>powered by</div>
                <div style={styles.logoTextOVIN}>OVIN Enterprise</div>
            </div>
            
            {/* MENU ITEMS */}
            <div style={styles.menuContainer}>
                <SingleLink to="/dashboard" label="Dashboard" icon="📊" />

                {/* SALES MENU */}
                <DropdownMenu 
                    title="Sales" 
                    icon="💼"
                    isOpen={activeMenu === 'sales'}
                    onToggle={() => setActiveMenu(activeMenu === 'sales' ? null : 'sales')}
                >
                    {/* 1. LEAD MANAGER (Sabse Upar) */}
                    <SubLink to="/leads" label="Lead Manager" />

                    {/* 2. SALES TASK MANAGER (Uske Niche) */}
                    <SubLink to="/sales-tasks" label="Sales Task Manager" />
                    
                    <SubLink to="/customers" label="Customer Manager" />
                    <SubLink to="/payments" label="Payment Status" />
                </DropdownMenu>

                {/* TECHNICAL MENU */}
                <DropdownMenu 
                    title="Technical" 
                    icon="🛠️"
                    isOpen={activeMenu === 'technical'}
                    onToggle={() => setActiveMenu(activeMenu === 'technical' ? null : 'technical')}
                >
                    <SubLink to="/tasks" label="Task Manager" />
                    <SubLink to="/tenders" label="Tender Submission" />
                    <SubLink to="/customer-data" label="Customer Data" />
                </DropdownMenu>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---
const SingleLink = ({ to, label, icon }) => {
    const [hover, setHover] = useState(false);
    const style = {
        display: 'flex', alignItems: 'center', padding: '12px 25px',
        color: hover ? '#00ffcc' : '#bbb', textDecoration: 'none',
        transition: 'all 0.3s ease', background: hover ? 'rgba(0, 255, 204, 0.05)' : 'transparent',
        borderLeft: hover ? '3px solid #00ffcc' : '3px solid transparent', cursor: 'pointer'
    };
    return (
        <Link to={to} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <span style={{ marginRight: '10px' }}>{icon}</span> {label}
        </Link>
    );
};

const DropdownMenu = ({ title, icon, children, isOpen, onToggle }) => {
    const [hover, setHover] = useState(false);
    const headerStyle = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 25px',
        color: (hover || isOpen) ? '#fff' : '#bbb', background: (hover || isOpen) ? '#252525' : 'transparent',
        cursor: 'pointer', transition: 'all 0.3s ease', userSelect: 'none'
    };
    const arrowStyle = { transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', fontSize: '12px', color: '#00ffcc' };
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div onClick={onToggle} style={headerStyle}>
                <span><span style={{ marginRight: '10px' }}>{icon}</span> {title}</span>
                <span style={arrowStyle}>▼</span>
            </div>
            <div style={{
                maxHeight: isOpen ? '400px' : '0', overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', background: '#151515'
            }}>
                <div style={{ padding: '10px 0' }}>{children}</div>
            </div>
        </div>
    );
};

const SubLink = ({ to, label }) => {
    const [hover, setHover] = useState(false);
    const style = {
        display: 'block', padding: '10px 20px 10px 50px', color: hover ? '#00ffcc' : '#888',
        textDecoration: 'none', fontSize: '14px', transition: 'all 0.3s ease',
        transform: hover ? 'translateX(10px)' : 'translateX(0)', cursor: 'pointer'
    };
    return (
        <Link to={to} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            • {label}
        </Link>
    );
};

export default Sidebar;