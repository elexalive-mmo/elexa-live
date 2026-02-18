import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import TapPage from './pages/TapToEarn';

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-elexa-bg text-white font-sans selection:bg-elexa-primary selection:text-white overflow-hidden">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<TapPage />} />
                    {/* Default redirect to login if no auth (mock) */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    );
}
