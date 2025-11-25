// src/config.js

// Jab deploy karoge, toh ye domain aayega (Render se milega)
const PROD_DOMAIN = 'https://YOUR-LIVE-DJANGO-DOMAIN.onrender.com/api/';
// Note: Isko badal kar apna actual deployed backend URL dalna

// Localhost ka URL
const DEV_API_URL = 'http://127.0.0.1:8000/api/';

// Ab hum check karte hain ki hum kis mode mein hain (Production vs Development)
// agar project build ho raha hai (PROD), toh PROD_DOMAIN use karo
const BASE_API_URL = import.meta.env.PROD 
    ? PROD_DOMAIN 
    : DEV_API_URL;

export default BASE_API_URL;