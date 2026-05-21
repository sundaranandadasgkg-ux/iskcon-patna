// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Direct API import kiya taaki AuthContext ka auto-login बाईपास ho sake
import { UserPlus, Mail, Lock, User, Briefcase, Shield, ShieldAlert } from 'lucide-react';

const Register = () => {
    // AuthContext hata diya kyunki hume register hote hi login NAI karwana hai
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'member',
        department: 'General'
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState(''); // Hold message status ke liye
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        
        try {
            // Context ke bajay direct axios/api se backend par request bhej rahe hain
            const res = await api.post('/users/register', formData);
            
            // Backend se confirmation aane par screen par rokna hai
            setSuccessMsg('🎯 Account request successfully submitted! Please wait for Admin approval before logging in.');
            
            // ⏳ 3.5 second baad user ko automatic login page par shift karenge
            setTimeout(() => {
                navigate('/login');
            }, 3500);

        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
                <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-600">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                        Create Account
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center font-medium">
                        {error}
                    </div>
                )}

                {/* 🔥 SECURITY HOLD SCREEN PROMPT */}
                {successMsg && (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-xs space-y-2 text-left font-medium">
                        <div className="flex items-center gap-1 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                            <ShieldAlert className="h-4 w-4 text-amber-600" /> Account Verification Under Review
                        </div>
                        <p>{successMsg}</p>
                        <span className="text-[10px] text-amber-500 block animate-pulse font-bold">Redirecting to Login portal panel shortly...</span>
                    </div>
                )}

                {/* Form tabhi dikhega jab tak success message na aaya ho */}
                {!successMsg && (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <User className="h-5 w-5" />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    placeholder="Suryakant"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                        <Shield className="h-5 w-5" />
                                    </span>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm capitalize"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                        <option value="tmc">TMC</option>
                                        <option value="zmt">ZMT</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                        <Briefcase className="h-5 w-5" />
                                    </span>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    >
                                        <option value="General">General</option>
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Outreach">Outreach</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:bg-orange-400 cursor-pointer"
                            >
                                {loading ? 'Submitting Request...' : 'Register'}
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            Pehle se account hai?{' '}
                            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                                Sign In kijiye
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;