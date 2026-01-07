// client/src/pages/OAuthSuccess.jsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// NOTE: Component now expects the global onLogin function from the parent/router
const OAuthSuccess = ({ onLogin }) => { 
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const userId = query.get('id');

        if (userId) {
            const exchangeForToken = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/oauth/token?id=${userId}`);
                    const data = await res.json(); 

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        
                        // 1. Update Global State/Context Flag
                        if (onLogin) onLogin(); // <--- CALLS GLOBAL LOGIN HANDLER
                        
                        // 2. Navigate
                        navigate('/dashboard'); 
                    } else {
                        throw new Error('Failed to retrieve token.');
                    }
                } catch (err) {
                    console.error('OAuth token exchange failed:', err);
                    navigate('/login'); 
                }
            };
            exchangeForToken();
        } else {
            navigate('/login');
        }
    }, [location.search, navigate, onLogin]); // <--- Added onLogin to dependencies

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <h1 className="mt-4 text-xl text-gray-700 dark:text-gray-300">Logging in via OAuth...</h1>
        </div>
    );
};

export default OAuthSuccess;