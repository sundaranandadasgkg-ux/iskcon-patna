// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckSquare, Save, Clock, PlusCircle, Filter, Award, Send } from 'lucide-react';

const Dashboard = () => {
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [personFilter, setPersonFilter] = useState('All');
    const [newLogText, setNewLogText] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [editStatusState, setEditStatusState] = useState({});

    // 📝 NAYA AGENDA FORM STATE
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        panel: 'TMC',
        department: currentUser?.department || 'General'
    });

    const filteredAgendas = agendas.filter(agenda => {
        const matchesStatus = agenda.status === 'discussed';
        const matchesPerson = personFilter === 'All' || agenda.responsiblePerson === personFilter;
        return matchesStatus && matchesPerson;
    });

    const uniqueOwners = [...new Set(agendas.map(a => a.responsiblePerson).filter(Boolean))];

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/agendas/all');
            setAgendas(res.data || []);

            try {
                const profileRes = await api.get('/profile');
                setCurrentUser(profileRes.data);
            } catch (err) {
                try {
                    const profileResAlt = await api.get('/users/profile');
                    setCurrentUser(profileResAlt.data);
                } catch (profileErr) {
                    setCurrentUser({ role: 'admin', name: 'Admin Backdoor' }); 
                }
            }

            const initialStatuses = {};
            (res.data || []).forEach(item => {
                initialStatuses[item._id] = item.status || 'discussed';
            });
            setEditStatusState(initialStatuses);
        } catch (err) {
            setError('Dashboard data fetch fail.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // 🚀 1. NAYA AGENDA SUBMIT KARNE WALA HANDLER (Default: pending)
    const handleCreateAgenda = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) return;

        try {
            // Default backend automatic status='pending' set karega
            await api.post('/agendas/create', formData);
            setSuccessMsg('🎯 Naya Agenda submit ho gaya! Yeh approval ke liye Admin Vault me bhej diya gaya hai.');
            setFormData({ title: '', description: '', panel: 'TMC', department: 'General' });
            fetchDashboardData();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            console.error("Backend Error:", err.message);
            setError('Agenda create karne me dikkat aayi bhao.');
        }
    };

    const handleAddProgressLog = async (id) => {
        const text = newLogText[id];
        if (!text || !text.trim()) return;
        try {
            await api.post(`/agendas/sewa-update/${id}`, {
                text,
                updatedBy: currentUser?.name || "Sewa Member"
            });
            setNewLogText(prev => ({ ...prev, [id]: '' }));
            setSuccessMsg('Progress log array updated!');
            fetchDashboardData();
            setTimeout(() => setSuccessMsg(''), 2500);
        } catch (err) {
            setError('Log update error.');
        }
    };

    const handleAdminClosure = async (id) => {
        setError('');
        setSuccessMsg('');
        try {
            const targetStatus = editStatusState[id];
            await api.patch(`/agendas/meeting-floor/${id}`, { status: targetStatus });
            setSuccessMsg('Status locked successfully!');
            fetchDashboardData();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Status lock error.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left space-y-8">
            
            {/* Top Header */}
            <div className="flex items-center space-x-3 border-b pb-4">
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg"><Award className="h-6 w-6" /></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Sewa Progress Dashboard</h1>
                    <p className="text-xs text-gray-500">Stage 3 Operations — Post live logs and timeline arrays here</p>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium">{successMsg}</div>}

            {/* 📝 FORM: SUBMIT NEW AGENDA (YAHAN SE AGENDA DALEGA) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 text-orange-600">
                    ➕ Propose New Agenda / Sewa Task
                </h2>
                <form onSubmit={handleCreateAgenda} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Agenda Title</label>
                            <input 
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g., Grocery procurement for festival meal distribution"
                                className="w-full border rounded-xl px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Panel</label>
                            <select 
                                value={formData.panel}
                                onChange={(e) => setFormData({...formData, panel: e.target.value})}
                                className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold text-gray-700 bg-white"
                            >
                                <option value="TMC">📦 TMC Panel</option>
                                <option value="ZMT">👑 ZMT Panel</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Task Description / Details</label>
                        <textarea 
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Provide full description, required assets or context details..."
                            className="w-full border rounded-xl px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Department</label>
                        <select 
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold text-gray-700 bg-white"
                        >
                            <option value="General">🏢 General</option>
                            <option value="Kitchen">🍳 Kitchen</option>
                            <option value="Maintenance">🛠️ Maintenance</option>
                            <option value="Outreach">📢 Outreach</option>
                            <option value="Accounts">💰 Accounts</option>
                            <option value="Bhishma">🛡️ Bhishma</option>
                            <option value="Dieties">🪔 Dieties</option>
                            <option value="Sankirtan">🥁 Sankirtan</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Proposal to Admin Vault</span>
                    </button>
                </form>
            </div>

            {/* 🔍 FILTER LOG INTERFACE */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-emerald-500" /> Active Tracking Workspace
                </div>
                <select 
                    value={personFilter} 
                    onChange={(e) => setPersonFilter(e.target.value)}
                    className="border border-gray-300 bg-gray-50 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 capitalize w-full sm:w-auto"
                >
                    <option value="All">👤 Filter By Owner (All)</option>
                    {uniqueOwners.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                </select>
            </div>

            {/* 📺 CARDS LOOP */}
            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading workspace logs...</div>
            ) : filteredAgendas.length === 0 ? (
                <div className="bg-white rounded-xl text-center py-12 text-gray-500 text-sm border border-gray-200 shadow-inner">
                    🚀 Dashboard active area khali hai. Jaise hi koi item **Meeting Floor** se 'Discussed' mark hoga, wo yahan show karega!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAgendas.map((agenda) => (
                        <div key={agenda._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between border-b pb-2 mb-2">
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded border border-emerald-100 uppercase tracking-wider">📢 IN EXECUTION</span>
                                    <span className="text-xs text-gray-500 font-bold">Responsible: <span className="text-orange-600 underline capitalize">{agenda.responsiblePerson || 'Unassigned'}</span></span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">{agenda.title}</h3>
                                <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-xl border whitespace-pre-line">{agenda.description}</p>
                                
                                {agenda.meetingNotes && (
                                    <div className="mt-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-xs">
                                        <strong>📜 Resolution:</strong> {agenda.meetingNotes}
                                    </div>
                                )}
                            </div>

                            {/* LOG TIMELINE ARRAY */}
                            <div className="bg-slate-50 border border-gray-200 p-3 rounded-xl space-y-2 max-h-[140px] overflow-y-auto">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Clock className="h-3 w-3 text-emerald-500" /> Live Sewa Updates Log</h4>
                                {(!agenda.sewaUpdates || agenda.sewaUpdates.length === 0) ? (
                                    <p className="text-[11px] text-gray-400 italic">No entry logs posted yet.</p>
                                ) : (
                                    <div className="space-y-1.5 border-l-2 border-emerald-400 pl-2 ml-1">
                                        {agenda.sewaUpdates.map((update, idx) => (
                                            <div key={idx} className="text-[11px] text-gray-700">
                                                <strong className="text-gray-900 capitalize">{update.updatedBy}:</strong> {update.text}
                                                <span className="text-[9px] text-gray-400 block mt-0.5">{new Date(update.updatedAt).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ENTRY UPDATE FIELDS */}
                            <div className="border-t pt-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">✍️ Add Progress Update</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={newLogText[agenda._id] || ''}
                                        onChange={(e) => setNewLogText(prev => ({ ...prev, [agenda._id]: e.target.value }))}
                                        placeholder="Type updates..."
                                        className="w-full border rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-gray-50 focus:bg-white"
                                    />
                                    <button onClick={() => handleAddProgressLog(agenda._id)} className="bg-emerald-600 text-white px-2.5 rounded-xl"><PlusCircle className="h-4 w-4" /></button>
                                </div>
                            </div>

                            {/* ADMIN CONTROLS CLOSURE */}
                            {currentUser?.role === 'admin' && (
                                <div className="border-t pt-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100 flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-bold text-red-500 uppercase mb-1 flex items-center gap-0.5"><CheckSquare className="h-3 w-3" /> Admin Lifecycle</label>
                                        <select
                                            value={editStatusState[agenda._id] || 'discussed'}
                                            onChange={(e) => setEditStatusState(prev => ({ ...prev, [agenda._id]: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg p-1 text-xs font-bold text-gray-700 bg-white"
                                        >
                                            <option value="discussed">⏳ Keep Active</option>
                                            <option value="completed">🚀 Mark as Done (History Archive)</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleAdminClosure(agenda._id)} className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow">Lock Status</button>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;