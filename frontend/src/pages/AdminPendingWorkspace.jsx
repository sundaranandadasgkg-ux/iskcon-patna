// frontend/src/pages/AdminPendingWorkspace.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, ArrowRight, Clock, AlertCircle } from 'lucide-react';

const AdminPendingWorkspace = () => {
    const [pendingAgendas, setPendingAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchPendingItems = async () => {
        try {
            // Backend se saare agendas mangwayenge
            const res = await api.get('/agendas/all');
            // Strict Filter: Sirf 'pending' items ko hi is workspace me jagah milegi
            const pendingOnly = res.data.filter(item => item.status === 'pending');
            setPendingAgendas(pendingOnly);
        } catch (err) {
            setError('Pending incoming items load nahi ho paye bhao.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const handleApproveToFloor = async (id) => {
        setError('');
        setSuccessMsg('');
        try {
            // Status ko badal kar 'approved' kar rahe hain taaki ye Meeting Floor par shift ho jaye
            await api.patch(`/agendas/meeting-floor/${id}`, { status: 'approved' });
            setSuccessMsg('Agenda Approved! Successfully pushed to Live Meeting Floor.');
            fetchPendingItems(); // Re-fetch se approved item instantly screen se gayab (disappear) ho jayega
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Approval trigger fail ho gaya.');
        }
    };


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
            {/* Top Heading */}
            <div className="flex items-center space-x-3 border-b border-gray-200 pb-4 mb-6">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Pending Review Vault</h1>
                    <p className="text-xs text-gray-500">Incoming Proposals Pipeline - Approve to push on Live Floor</p>
                </div>
            </div>

            {/* Messages */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 font-medium">{successMsg}</div>}

            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading review vault...</div>
            ) : pendingAgendas.length === 0 ? (
                <div className="bg-white rounded-xl text-center py-12 text-gray-500 text-sm border border-gray-200 shadow-inner">
                    🎉 Pipeline ekदम saaf hai! Koi bhi naya pending agenda review ke liye ruka nahi hai.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingAgendas.map((agenda) => (
                        <div key={agenda._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                            <div>
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                                    <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-amber-200/50 uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Status: New Pending
                                    </span>
                                    <span className="text-xs font-medium text-gray-400">
                                        By: <strong className="text-gray-600 capitalize">{agenda.submittedBy?.name || 'Member'}</strong>
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">{agenda.title}</h3>
                                <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 whitespace-pre-line">{agenda.description}</p>
                            </div>

                            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                <span>Panel: <strong>{agenda.panel}</strong></span>
                                <span>Dept: <strong>{agenda.department}</strong></span>
                            </div>

                            {/* Push Button */}
                            <button
                                onClick={() => handleApproveToFloor(agenda._id)}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                            >
                                <span>Push to Live Meeting Floor</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>

                            {/* 🔥 NAYA DELETE BUTTON (Isse yahan add karo bhao) */}
                            <button
                                onClick={async () => {
                                    if (window.confirm("⚠️ Confirm DELETE? Yeh agenda permanently remove ho jayega!")) {
                                        try {
                                            // Delete API call (Make sure your backend has this route)
                                            await api.delete(`/agendas/delete/${agenda._id}`);
                                            setSuccessMsg("Agenda uda diya bhao!");
                                            fetchPendingItems(); // List refresh karne ke liye
                                        } catch (err) {
                                            setError("Delete nahi ho paya.");
                                        }
                                    }
                                }}
                                className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 border border-red-200 transition-all cursor-pointer"
                            >
                                <span>Reject / Delete Agenda</span>
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPendingWorkspace;