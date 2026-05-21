// frontend/src/pages/Profile.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user: loggedInUser } = useContext(AuthContext);
    const [profileName, setProfileName] = useState(loggedInUser?.name || '');
    const [password, setPassword] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const isAdmin = loggedInUser?.role === 'admin';

    const fetchAllUsers = async () => {
        if (!isAdmin) return;
        try {
            const res = await api.get('/users/admin/all-users');
            setAllUsers(res.data);
        } catch (err) {
            setErr('Users list load karne me dikkat aayi.');
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMsg(''); setErr('');
        try {
            await api.put('/users/profile/update', { name: profileName, password });
            setMsg('Aapka profile/password update ho gaya hai bhai!');
            setPassword('');
        } catch (error) {
            setErr('Profile update fail ho gaya.');
        }
    };

    const handleUserApproval = async (id, currentStatus) => {
        try {
            await api.patch(`/users/admin/user-control/${id}`, { isApproved: !currentStatus });
            fetchAllUsers(); // Table reload karne ke liye
            setMsg('User status updated successfully!');
        } catch (error) {
            setErr('Status change nahi ho paya.');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.patch(`/users/admin/user-control/${id}`, { role: newRole });
            fetchAllUsers();
            setMsg('User ka role badal diya gaya hai!');
        } catch (error) {
            setErr('Role change fail hua.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                👤 Account Settings & Control Floor
            </h1>

            {msg && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 font-semibold mb-4 text-sm">{msg}</div>}
            {err && <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 font-semibold mb-4 text-sm">{err}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* LEFT PANEL: PROFILE UPDATE */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h2 className="text-base font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Update Personal Lock</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
                            <input 
                                type="text" 
                                value={profileName} 
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                            <input type="text" disabled value={loggedInUser?.email || ''} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-not-allowed"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                placeholder="Naya password type karein..."
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all">
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* RIGHT PANEL: ADMIN CONTROL SYSTEM */}
                <div className="lg:col-span-2">
                    {isAdmin ? (
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <h2 className="text-base font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Global Users & Gatekeeper Lock</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3">Member Details</th>
                                            <th className="px-3 py-3">Role Gate</th>
                                            <th className="px-3 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {allUsers.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50/50">
                                                <td className="px-3 py-3.5">
                                                    <div className="font-bold text-gray-900 capitalize">{u.name}</div>
                                                    <div className="text-xs text-gray-400">{u.email}</div>
                                                    <div className="text-[10px] bg-gray-100 text-gray-500 font-medium px-1.5 py-0.5 rounded w-fit mt-1">📦 {u.department || 'General'}</div>
                                                </td>
                                                <td className="px-3 py-3.5">
                                                    <select 
                                                        value={u.role} 
                                                        disabled={u._id === loggedInUser.id}
                                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                        className="border border-gray-300 bg-white rounded-lg p-1 text-xs font-semibold text-gray-700 focus:outline-none"
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="tmc">TMC</option>
                                                        <option value="zmt">ZMT</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                {/* ... upar ka code waisa hi rahega ... */}
                                                <td className="px-3 py-3.5 flex gap-2"> {/* flex gap-2 lagaya taaki buttons paas-paas dikhein */}
                                                    {u._id === loggedInUser.id ? (
                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">You</span>
                                                    ) : (
                                                        <>
                                                            {/* ✅ APPROVAL BUTTON */}
                                                            <button 
                                                                onClick={() => handleUserApproval(u._id, u.isApproved)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                                                    u.isApproved 
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                                }`}
                                                            >
                                                                {u.isApproved ? 'Approved' : 'Approve'}
                                                            </button>

                                                            {/* 🗑️ DELETE/REJECT BUTTON (Naya add kiya) */}
                                                            <button 
                                                                onClick={async () => {
                                                                    if (window.confirm(`⚠️ ${u.name} ko system se permanent remove karein?`)) {
                                                                        try {
                                                                            await api.delete(`/users/delete-user/${u._id}`);
                                                                            setMsg(`${u.name} ko hamesha ke liye uda diya bhao!`);
                                                                            fetchAllUsers(); // List refresh
                                                                        } catch (err) {
                                                                            setErr('Delete fail ho gaya.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 cursor-pointer"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 text-sm">
                            💡 <strong>Access Note:</strong> Aap ek standard account use kar rahe hain. Kisi anya member ke profile ko edit karne ya approval pass karne ka exclusive control sirf Admin desk ke paas surakshit hai.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;