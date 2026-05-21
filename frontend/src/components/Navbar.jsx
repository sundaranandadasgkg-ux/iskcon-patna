// frontend/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Clock, Award, Archive, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // 🔒 STRICT SECURITY CHECK: Standard accounts ko filter out karna
    // .toLowerCase() lagane se agar DB me 'Admin' ya 'TMC' capital bhi hoga toh sahi chalega
    const isAdmin = user && 
                         user.role && 
                         ['admin'].includes(user.role.toLowerCase()) &&
                         user.role.toLowerCase() !== 'user'; // Strict elimination for standard user role

    const isManagement = user && 
                         user.role && 
                         ['admin','tmc', 'zmt'].includes(user.role.toLowerCase()) &&
                         user.role.toLowerCase() !== 'user'; // Strict elimination for standard user role

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {/* LEFT SIDE: BRAND LOGO */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-base font-black tracking-wider text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60">
                                🚀 SEWA ENGINE
                            </span>
                        </Link>
                    </div>

                    {/* MIDDLE & RIGHT SIDE: DYNAMIC NAVIGATION TABS */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {user ? (
                            <>
                                {/* Common Role: Active Sewa Dashboard */}
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-200/40"
                                >
                                    <Award className="h-4 w-4 text-emerald-500" />
                                    <span className="hidden md:inline">Sewa Dashboard</span>
                                </Link>

                                {/* 🔐 Conditional Management Tabs */}
                                {isAdmin ? (
                                    <>
                                        {/* ADMIN VAULT LINK */}
                                        <Link 
                                            to="/admin-vault" 
                                            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50/50 hover:bg-amber-100/70 transition-all border border-amber-200/40"
                                        >
                                            <ShieldCheck className="h-4 w-4 text-amber-500" />
                                            <span>Admin Vault</span>
                                        </Link>

                                    </>
                                ) : null}

                                {/* 🔐 Conditional Management Tabs */}
                                {isAdmin ? (
                                    <>

                                        {/* MEETING FLOOR LINK */}
                                        <Link 
                                            to="/meeting-floor" 
                                            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-orange-700 bg-orange-50/50 hover:bg-orange-100/70 transition-all border border-orange-200/40"
                                        >
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            <span>Meeting Floor</span>
                                        </Link>
                                    </>
                                ) : null}

                                {/* Common Role: History Archives */}
                                <Link 
                                    to="/history" 
                                    className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-200/40"
                                >
                                    <Archive className="h-4 w-4 text-blue-500" />
                                    <span className="hidden md:inline">History Logs</span>
                                </Link>

                                <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

                                {/* Profile Link */}
                                <Link 
                                    to="/profile" 
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                    title="View Profile"
                                >
                                    <User className="h-4 w-4" />
                                </Link>

                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all border border-transparent cursor-pointer"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-xs font-bold text-gray-600 hover:text-orange-600 px-3 py-2">Login</Link>
                                <Link to="/register" className="bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow">Sign Up</Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;