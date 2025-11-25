// src/hooks/useSessionTimeout.js

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// 5 minutes in milliseconds
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; 

const useSessionTimeout = (isLoggedIn, setIsLoggedIn) => {
    const timeoutRef = useRef(null);

    // 1. Session expire hone par kya karna hai
    const handleLogout = useCallback(() => {
        clearTimeout(timeoutRef.current);
        
        // LocalStorage se tokens hatao
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        
        // App state update karo
        setIsLoggedIn(false); 
        
        toast.error('Session Expired. Please log in again.', { duration: 4000 });
        // Redirection automatically ProtectedRoute se ho jayega
    }, [setIsLoggedIn]);

    // 2. Timer ko set/reset karne ka function
    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Naya timer set karo jo 5 minute baad handleLogout ko call karega
        timeoutRef.current = setTimeout(handleLogout, SESSION_TIMEOUT_MS);
    }, [handleLogout]);

    useEffect(() => {
        if (!isLoggedIn) {
            // Agar logged out hai, toh timer clear rakho
            clearTimeout(timeoutRef.current);
            return;
        }

        resetTimeout();

        // --- User Activity Track karna ---
        const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];
        
        // Activity hone par timer reset kar do
        const handleActivity = () => {
            resetTimeout();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup function
        return () => {
            clearTimeout(timeoutRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isLoggedIn, resetTimeout]);
};

export default useSessionTimeout;