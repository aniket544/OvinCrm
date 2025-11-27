// src/App.jsx (Final Code)
import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

// Imports for Components
import LeadManager from "./components/Sales/LeadManager";
import CustomerManager from "./components/Sales/CustomerManager";
import PaymentStatus from "./components/Sales/PaymentStatus";
import TenderSubmission from "./components/Technical/TenderSubmission";
import CustomerData from "./components/Technical/CustomerData";
import TaskManager from "./components/Technical/TaskManager";
import SalesTaskManager from "./components/Sales/SalesTaskManager";
import Login from "./components/login/Login";
// ✅ Sahi Wala (Agar folder ka naam Capital R se hai)
import Register from "./components/Register/Register";
import Dashboard from "./components/dashboard/dashboard";
import Layout from "./components/Layout/Layout";

// NEW: Session Timeout Hook
import useSessionTimeout from "./components/useSessionTimeout/useSessionTimeout";


const App = () => {
    // Check if token exists on initial load
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access_token")
    );

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);

        toast.success("Logged Out Successfully!", {
            icon: "👋",
            style: {
                borderRadius: "10px",
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid #ff0055",
            },
        });
    };

    // --- SESSION TIMEOUT IMPLEMENTATION ---
    // Har 5 min ki inactivity par auto-logout hoga
    useSessionTimeout(isLoggedIn, setIsLoggedIn); 


    // 1. Protected Route: Ensures access only if logged in
    const ProtectedRoute = ({ children }) => {
        if (!isLoggedIn) {
            return <Navigate to="/login" replace />;
        }
        return <Layout handleLogout={handleLogout}>{children}</Layout>;
    };

    // 2. Public Route: Redirects to dashboard if already logged in
    const PublicRoute = ({ children }) => {
        if (isLoggedIn) {
            return <Navigate to="/dashboard" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#0f0f0f",
                        color: "#00ffcc",
                        border: "1px solid #00ffcc",
                        boxShadow: "0 0 10px rgba(0, 255, 204, 0.5)",
                    },
                }}
            />

            <Routes>
                {/* Default route: Bhejo /login par agar not logged in */}
                <Route path="/" element={<Navigate to="/login" />} /> 

                {/* Public Routes (Login/Register) */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login setIsLoggedIn={setIsLoggedIn} />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* --- PROTECTED ROUTES --- */}
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                />
                <Route
                    path="/leads"
                    element={<ProtectedRoute><LeadManager /></ProtectedRoute>}
                />
                <Route
                    path="/customers"
                    element={<ProtectedRoute><CustomerManager /></ProtectedRoute>}
                />
                <Route
                    path="/payments"
                    element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>}
                />
                <Route
                    path="/tasks"
                    element={<ProtectedRoute><TaskManager /></ProtectedRoute>}
                />
                <Route
                    path="/tenders"
                    element={<ProtectedRoute><TenderSubmission /></ProtectedRoute>}
                />
                <Route
                    path="/customer-data"
                    element={<ProtectedRoute><CustomerData /></ProtectedRoute>}
                />
                <Route
                    path="/sales-tasks"
                    element={<ProtectedRoute><SalesTaskManager /></ProtectedRoute>}
                />
            </Routes>
        </Router>
    );
};

export default App;