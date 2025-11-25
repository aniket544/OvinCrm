import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../header/header';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children, handleLogout }) => { 
    return (
        <div className="d-flex">
            <Sidebar /> 

            <div style={{ 
                marginLeft: '320px', // <--- WIDTH MATCH KI (Pehle 260px tha)
                width: 'calc(100% - 320px)', // <--- WIDTH MATCH KI
                minHeight: '100vh',
                background: '#0f0f0f',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Header handleLogout={handleLogout} />

                <div style={{ padding: '30px', color: '#e0e0e0' }}>
                    {children} 
                </div>
            </div>
        </div>
    );
};

export default Layout;