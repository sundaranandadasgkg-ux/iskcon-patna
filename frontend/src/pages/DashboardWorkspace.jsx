// frontend/src/pages/DashboardWorkspace.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckSquare, Save, Clock, PlusCircle, Filter, Award } from 'lucide-react';

const DashboardWorkspace = () => {
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [personFilter, setPersonFilter] = useState('All');
    const [newLogText, setNewLogText] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [editStatusState, setEditStatusState] = useState({});

    // Unique names list for filtering
    const uniqueOwners = [...new Set(agendas.map(a => a.responsiblePerson).filter(Boolean))];

    const filteredAgendas = agendas.filter(agenda => {
        if (personFilter === 'All') return true;
        return agenda.responsiblePerson === personFilter;
    });

    const fetchDashboardData = async () => {
        try {
            // 🔥 Target strictly 'discussed' active workspace logs
            const res = await api.get('/agendas/dashboard-active');
            setAgendas(res.data);

            const profileRes = await api.get('/users/profile');
            setCurrentUser(profileRes.data);

            const initialStatuses = {};
            res.data.forEach(item => {
                initialStatuses[item._id] = item.status;
            });
            setEditStatusState(initialStatuses);
        } catch (err) {
            setError('Dashboard live feed load nahi ho paya.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAddProgressLog = async (id) => {
        const text = newLogText[id];
        if (!text || !text.trim()) return;

        try {
            await api.post(`/agendas/sewa-update/${id}`, {
                text,
                updatedBy: currentUser?.name || "Sewa Member"
            });
            setNewLogText(prev => ({ ...prev, [id]: '' }));
            setSuccessMsg('Sewa action log updated in database array!');
            fetchDashboardData();
            setTimeout(() => setSuccessMsg(''), 2500);
        } catch (err) {
            setError('Log entry verification fail.');
        }
    };

    const handleAdminClosure = async (id) => {
        setError('');
        setSuccessMsg('');
        try {
            const targetStatus = editStatusState[id];
            await api.patch(`/agendas/meeting-floor/${id}`, { status: targetStatus });
            setSuccessMsg('Sewa closed! Moved to official history archives.');
            fetchDashboardData(); // Disappears instantly if completed!
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Status closure update error.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
            <div className="flex items-center space-x-3 border-b pb-4 mb-6">
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg"><Award className="h-6 w-6" /></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Sewa Progress Dashboard</h1>
                    <p className="text-xs text-gray-500">Live operational panel for tracked tasks & resolution outputs</p>
                </div>
            </div>

            {/* Top filter bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex justify-between items-center">
                <div className="text-sm font-bold text-gray-700 flex items-center gap-2"><Filter className="h-4 w-4 text-orange-500" /> Active Tracking Feed</div>
                <select 
                    value={personFilter} 
                    onChange={(e) => setPersonFilter(e.target.value)}
                    className="border border-gray-300 bg-gray-50 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 capitalize"
                >
                    <option value="All">👤 Filter By Owner (All)</option>
                    {uniqueOwners.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                </select>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{successMsg}</div>}

            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading dynamic dashboard workspace...</div>
            ) : filteredAgendas.length === 0 ? (
                <div className="bg-white rounded-xl text-center py-12 text-gray-500 text-sm border border-gray-200 shadow-inner">
                    🚀 Filhal dashboard workspace par koi active discussed item execution me nahi chal raha hai bhao!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAgendas.map((agenda) => (
                        <div key={agenda._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between border-b pb-2 mb-2">
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded border border-emerald-100 uppercase tracking-wider">📢 IN EXECUTION DISCUSSIONS</span>
                                    <span className="text-xs text-gray-500 font-bold">Responsible: <span className="text-orange-600 underline capitalize">{agenda.responsiblePerson || 'Unassigned'}</span></span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900">{agenda.title}</h3>
                                <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-xl border">{agenda.description}</p>
                                {agenda.meetingNotes && (
                                    <div className="mt-2 bg-amber-50/50 border border-amber-200/60 text-amber-900 rounded-xl p-2.5 text-xs">
                                        <strong>📜 Official Resolution Passed:</strong> {agenda.meetingNotes}
                                    </div>
                                )}
                            </div>

                            {/* 📜 ARRAY HISTORY LOG DISPLAY */}
                            <div className="bg-slate-50 border border-gray-200 p-3 rounded-xl space-y-2 max-h-[140px] overflow-y-auto">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Clock className="h-3 w-3 text-emerald-500" /> Sewa Timeline Updates Log Array</h4>
                                {(!agenda.sewaUpdates || agenda.sewaUpdates.length === 0) ? (
                                    <p className="text-[11px] text-gray-400 italic">No updates posted yet.</p>
                                ) : (
                                    <div className="space-y-1.5 border-l-2 border-emerald-400 pl-2 ml-1">
                                        {agenda.sewaUpdates.map((update, idx) => (
                                            <div key={idx} className="text-[11px] text-gray-700">
                                                <strong className="text-gray-900 capitalize">{update.updatedBy}:</strong> {update.text}
                                                <span className="text-[9px] text-gray-400 block">{new Date(update.updatedAt).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 🖊️ POST RE-ENTRIES LOG INPUT */}
                            <div className="border-t pt-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">✍️ Add Progress Update Entry</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={newLogText[agenda._id] || ''}
                                        onChange={(e) => setNewLogText(prev => ({ ...prev, [agenda._id]: e.target.value }))}
                                        placeholder="Type operational log..."
                                        className="w-full border rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <button onClick={() => handleAddProgressLog(agenda._id)} className="bg-emerald-600 text-white px-2.5 rounded-xl"><PlusCircle className="h-4 w-4" /></button>
                                </div>
                            </div>

                            {/* 👑 ADMIN LIFECYCLE CLOSURE INTERFACE */}
                            {currentUser?.role === 'admin' && (
                                <div className="border-t pt-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100 flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-bold text-red-500 uppercase mb-1 flex items-center gap-0.5"><CheckSquare className="h-3 w-3" /> Admin Lifecycle Status Closure</label>
                                        <select
                                            value={editStatusState[agenda._id] || 'discussed'}
                                            onChange={(e) => setEditStatusState(prev => ({ ...prev, [agenda._id]: e.target.value }))}
                                            className="w-full border rounded-lg p-1 text-xs font-bold text-gray-700 bg-white"
                                        >
                                            <option value="discussed">⏳ Keep Active in Dashboard</option>
                                            <option value="completed">🚀 Mark as Done (Archived History)</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleAdminClosure(agenda._id)} className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl h-fit self-end shadow">Lock Done</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardWorkspace;