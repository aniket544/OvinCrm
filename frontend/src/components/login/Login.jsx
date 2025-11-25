import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 
import { toast } from 'react-hot-toast';
import BASE_API_URL from '../../config'; // <-- Imported the central config

const Login = ({ setIsLoggedIn }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Accessing Mainframe...');

        try {
            // FIX: Using the global BASE_API_URL constant
            const response = await axios.post(`${BASE_API_URL}token/`, formData); 
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('username', formData.username);
            
            setIsLoggedIn(true);
            toast.success('Access Granted!', { id: toastId });
            navigate('/dashboard', { replace: true });
            
        } catch (error) {
            console.error('Error:', error);
            toast.error('Access Denied! Invalid Credentials.', { 
                id: toastId,
                style: { border: '1px solid #ff0055', color: '#ff0055' } 
            });
        }
    };

    // --- STYLES FOR CENTERING AND DARK THEME ---
    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: '#0f0f0f' 
    };
    
    const cardStyle = {
        background: '#1a1a1a', 
        padding: '30px', 
        borderRadius: '15px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.7)', 
        border: '1px solid #333',
        color: '#e0e0e0',
        width: '100%', 
        maxWidth: '400px'
    };

    const inputStyle = {
        background: '#333', 
        color: '#fff', 
        border: '1px solid #444',
        padding: '10px',
        borderRadius: '5px',
        width: '100%'
    };

    const buttonStyle = {
        background: 'linear-gradient(45deg, #00ffcc, #00c3ff)',
        border: 'none', 
        color: '#000', 
        fontWeight: 'bold', 
        padding: '12px',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 0 10px rgba(0, 255, 204, 0.4)'
    };

    return (
        <div style={pageStyle}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={cardStyle}>
                    <h2 style={{color: '#00ffcc', textAlign: 'center', marginBottom: '25px'}}>System Login</h2>
                    
                    <form onSubmit={handleSubmit}>
                        
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px'}}>Username</label>
                            <input 
                                type="text" 
                                name="username" 
                                onChange={handleChange} 
                                style={inputStyle} 
                                required 
                            />
                        </div>
                        
                        <div style={{marginBottom: '25px'}}>
                            <label style={{display: 'block', marginBottom: '5px'}}>Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                onChange={handleChange} 
                                style={inputStyle} 
                                required 
                            />
                        </div>
                        
                        <button type="submit" style={buttonStyle}>ENTER SYSTEM</button>
                    </form>

                    <div style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
                        <p style={{ color: '#bbb' }}>
                            New User?{' '}
                            <Link to="/register" style={{ color: '#00ffcc', textDecoration: 'none', fontWeight: 'bold' }}>
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;