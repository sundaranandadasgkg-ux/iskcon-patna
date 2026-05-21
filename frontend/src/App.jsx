// frontend/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // Yeh ab 'discussed' items ka main tracking board hoga
import MeetingFloor from './pages/MeetingFloor'; // 'approved' items ka decision floor
import AdminPendingWorkspace from './pages/AdminPendingWorkspace'; // 'pending' items ka vault
import SewaHistoryArchives from './pages/SewaHistoryArchives'; // 'completed' items ki history
import Profile from './pages/Profile';

// 🔒 SECURITY GATE 1: Sirf Logged-In Users ke liye (Dashboard, Profile, History)
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="text-center py-20 text-sm text-gray-500">Authenticating...</div>;
    return user ? children : <Navigate to="/login" />;
};

// 🔒 SECURITY GATE 2: Admin / TMC / ZMT Role Restriction (Meeting Floor & Admin Vault Only)
const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="text-center py-20 text-sm text-gray-500">Checking Authorization...</div>;
    
    const hasAccess = user && ['admin', 'tmc', 'zmt'].includes(user.role);
    return hasAccess ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 antialiased font-sans">
            {/* Navbar automatic top par rahega aur logged-in user state screen par layout karega */}
            <Navbar />
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

                    {/* Secured Member Dashboard (Stage 3: Discussed Sewa Active Progress Workspace) */}
                    <Route path="/dashboard" element = {
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element = {
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    {/* 🏛️ NAYA PATH Stage 4: Completed/Done items ki official history logs */}
                    <Route path="/history" element = {
                        <ProtectedRoute>
                            <SewaHistoryArchives />
                        </ProtectedRoute>
                    } />

                    {/* 🔐 High-Level Executive Stage 2: Approved Meeting Floor */}
                    <Route path="/meeting-floor" element = {
                        <AdminRoute>
                            <MeetingFloor />
                        </AdminRoute>
                    } />

                    {/* 🔐 NAYA PATH Stage 1: Incoming Proposals/New Pending Review Vault */}
                    <Route path="/admin-vault" element = {
                        <AdminRoute>
                            <AdminPendingWorkspace />
                        </AdminRoute>
                    } />

                    {/* Fallback Redirect */}
                    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                </Routes>
            </main>
        </div>
    );
}

// Global Provider Wrapper
export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}