import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Creating Identity...');

        try {
            await axios.post('http://127.0.0.1:8000/api/register/', formData);
            
            toast.success('Identity Created Successfully!', { id: toastId });
            navigate('/login');
        } catch (error) {
            toast.error('Creation Failed. Username might be taken.', { 
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
        background: '#0f0f0f' // Dark background for contrast
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
        background: '#2a2a2a', 
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
                    <h2 style={{color: '#00ffcc', textAlign: 'center', marginBottom: '25px'}}>New Registration</h2>
                    
                    <form onSubmit={handleSubmit}>
                        
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px'}}>Username</label>
                            <input type="text" name="username" onChange={handleChange} style={inputStyle} required />
                        </div>
                        
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px'}}>Email</label>
                            <input type="email" name="email" onChange={handleChange} style={inputStyle} required />
                        </div>
                        
                        <div style={{marginBottom: '25px'}}>
                            <label style={{display: 'block', marginBottom: '5px'}}>Password</label>
                            <input type="password" name="password" onChange={handleChange} style={inputStyle} required />
                        </div>
                        
                        <button type="submit" style={buttonStyle}>REGISTER</button>
                    </form>
                    
                    <div style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
                        <Link to="/login" style={{color: '#00ffcc', textDecoration: 'none'}}>Already have an account? Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;