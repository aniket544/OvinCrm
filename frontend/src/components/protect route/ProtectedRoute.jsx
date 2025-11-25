// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn }) => {
    // Agar user logged in nahi hai (isLoggedIn false hai)
    if (!isLoggedIn) {
        // Toh /login par redirect kar do. 'replace' se history clear ho jaati hai.
        return <Navigate to="/login" replace />;
    }

    // Agar logged in hai, toh desired component (e.g., Dashboard) render karo.
    return <Outlet />;
};

export default ProtectedRoute;