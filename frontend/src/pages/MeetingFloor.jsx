// frontend/src/pages/MeetingFloor.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { ShieldAlert, CheckSquare, Save, Calendar, User, MessageSquare, Filter } from 'lucide-react';

const MeetingFloor = () => {
    const [agendas, setAgendas] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [panelFilter, setPanelFilter] = useState('All');
    const [editState, setEditState] = useState({});

    const filteredAgendas = agendas.filter(agenda => {
        if (panelFilter === 'All') return true;
        return agenda.panel?.toUpperCase() === panelFilter.toUpperCase();
    });

    const fetchFloorData = async () => {
        try {
            // 🔥 CORRECTED API ENDPOINTS: Target strictly 'approved' items
            const agendaRes = await api.get('/agendas/meeting-floor'); 
            setAgendas(agendaRes.data);
            
            // User endpoints are requested from the core user authentication router
            const usersRes = await api.get('/users/admin/all-users');
            setUsersList(usersRes.data);

            const initialEdits = {};
            agendaRes.data.forEach(item => {
                initialEdits[item._id] = {
                    status: item.status || 'approved',
                    meetingNotes: item.meetingNotes || '',
                    responsiblePerson: item.responsiblePerson || '',
                    dueDate: item.dueDate ? item.dueDate.split('T')[0] : ''
                };
            });
            setEditState(initialEdits);
        } catch (err) {
            setError('Meeting floor components sync fail.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFloorData();
    }, []);

    const handleInputChange = (id, field, value) => {
        setEditState(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleUpdate = async (id) => {
        setError('');
        setSuccessMsg('');
        try {
            const payload = editState[id];
            // Update updates status to 'discussed' to push it to the main dashboard workspace
            await api.patch(`/agendas/meeting-floor/${id}`, payload);
            setSuccessMsg('Meeting decision recorded! Item moved to Dashboard workspace.');
            fetchFloorData(); // Live refresh -> Item disappears instantly!
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Floor transition locking failed.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
            <div className="flex items-center space-x-3 border-b border-gray-200 pb-4 mb-6">
                <div className="bg-red-100 text-red-700 p-2 rounded-lg"><ShieldAlert className="h-6 w-6" /></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Management Meeting Floor</h1>
                    <p className="text-xs text-gray-500">Authorized Arena for Panel Floor Debates & Status Transitions</p>
                </div>
            </div>

            {/* Filter Control bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">Active Approved Agendas Under Review</span>
                <select 
                    value={panelFilter} 
                    onChange={(e) => setPanelFilter(e.target.value)}
                    className="border border-gray-300 bg-gray-50 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="All">🌐 All Panels</option>
                    <option value="TMC">📦 TMC Only</option>
                    <option value="ZMT">👑 ZMT Only</option>
                </select>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{successMsg}</div>}

            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading floor dashboard...</div>
            ) : filteredAgendas.length === 0 ? (
                <div className="bg-white rounded-xl text-center py-12 text-gray-500 text-sm border">
                    🌟 Floor par koi item pending nahi hai. Saare items process ho chuke hain!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAgendas.map((agenda) => {
                        const currentEdit = editState[agenda._id] || {};
                        return (
                            <div key={agenda._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                                        <span className="bg-orange-50 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">{agenda.panel} / {agenda.department}</span>
                                        <span className="text-xs text-gray-400">By: <strong className="capitalize text-gray-600">{agenda.submittedBy?.name}</strong></span>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">{agenda.title}</h3>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border mt-2">{agenda.description}</p>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Floor Action Status</label>
                                            <select
                                                value={currentEdit.status || 'approved'}
                                                onChange={(e) => handleInputChange(agenda._id, 'status', e.target.value)}
                                                className="w-full border rounded-xl p-2 text-xs font-semibold text-gray-700 bg-white"
                                            >
                                                <option value="approved">⏳ Keep in Approved Floor</option>
                                                <option value="discussed">📢 Move to Dashboard (Discussed)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Due Date</label>
                                            <input
                                                type="date"
                                                value={currentEdit.dueDate || ''}
                                                onChange={(e) => handleInputChange(agenda._id, 'dueDate', e.target.value)}
                                                className="w-full border rounded-xl p-1.5 text-xs text-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Assign Responsible Person</label>
                                        <select
                                            value={currentEdit.responsiblePerson || ''}
                                            onChange={(e) => handleInputChange(agenda._id, 'responsiblePerson', e.target.value)}
                                            className="w-full border rounded-xl p-2 text-xs font-semibold text-gray-700 bg-white capitalize"
                                        >
                                            <option value="">-- Assign Member --</option>
                                            {usersList.map(u => (
                                                <option key={u._id} value={u.name}>{u.name} ({u.role})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Live Meeting Notes / Resolutions</label>
                                        <textarea
                                            rows="2"
                                            value={currentEdit.meetingNotes || ''}
                                            onChange={(e) => handleInputChange(agenda._id, 'meetingNotes', e.target.value)}
                                            className="w-full border rounded-xl p-2 text-xs text-gray-700"
                                            placeholder="Passed resolutions..."
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUpdate(agenda._id)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    <span>Lock Floor Decision & Shift</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MeetingFloor;