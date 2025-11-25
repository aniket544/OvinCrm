import React from 'react';

const Header = ({ handleLogout }) => {
    const username = localStorage.getItem('username') || 'User';

    const styles = {
        headerContainer: {
            height: '70px',
            background: '#1a1a1a',
            display: 'flex',
            justifyContent: 'space-between', // <--- YAHAN CHANGE KIYA (Right-Left Separate)
            alignItems: 'center',
            padding: '0 30px',
            borderBottom: '1px solid #333',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            // marginRight hata diya kyunki ab ye Left mein hai
            color: '#fff',
            fontFamily: "'Segoe UI', sans-serif"
        },
        avatar: {
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #00ffcc, #00c3ff)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#000',
            marginRight: '12px',
            fontSize: '18px'
        },
        welcomeText: {
            fontSize: '14px',
            color: '#bbb'
        },
        userName: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff'
        },
        logoutBtn: {
            background: 'transparent',
            border: '1px solid #ff0055',
            color: '#ff0055',
            padding: '8px 20px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }
    };

    return (
        <div style={styles.headerContainer}>
            {/* User Info ab Left mein aayega */}
            <div style={styles.userInfo}>
                <div style={styles.avatar}>
                    {username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={styles.welcomeText}>Welcome,</div>
                    <div style={styles.userName}>{username}</div>
                </div>
            </div>

            {/* Logout Button ab Right mein aayega */}
            <button 
                style={styles.logoutBtn} 
                onClick={handleLogout}
                onMouseOver={(e) => {
                    e.target.style.background = '#ff0055';
                    e.target.style.color = '#fff';
                    e.target.style.boxShadow = '0 0 15px rgba(255, 0, 85, 0.6)';
                }}
                onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#ff0055';
                    e.target.style.boxShadow = 'none';
                }}
            >
                Logout 🚪
            </button>
        </div>
    );
};

export default Header;