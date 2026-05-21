// frontend/src/pages/SewaHistoryArchives.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Archive, Clock, CheckCircle2, Calendar, User, MessageSquare, Trash2 } from 'lucide-react';

const SewaHistoryArchives = () => {
    const [historyAgendas, setHistoryAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchHistoryData = async () => {
        try {
            const res = await api.get('/agendas/history');
            setHistoryAgendas(res.data || []);
        } catch (err) {
            setError('History logs load karne me dikkat aayi bhao.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryData();
    }, []);

    // 🚨 PERMANENT WIPE HANDLER WITH CONFIRMATION
    const handleClearAllHistory = async () => {
        const confirmWipe = window.confirm(
            "⚠️ ATTENTION BHAO!\n\nKya aap sach me saari completed history delete karna chahte hain?\nYeh data permanent delete ho jayega aur wapas nahi aayega!"
        );

        if (!confirmWipe) return;

        try {
            setError('');
            setSuccessMsg('');
            await api.delete('/agendas/clear-history');
            setSuccessMsg('💥 History Vault successfully cleared and wiped out!');
            setHistoryAgendas([]); // Instant state clear for UI fluidity
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError('History clear trigger fail ho gaya. Backend route check karein.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
            
            {/* Top Header Banner with Action Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Official Sewa History Archives</h1>
                        <p className="text-xs text-gray-500">Locked & Closed Tasks Timeline — Permanent Record Ledger</p>
                    </div>
                </div>

                {/* 🔥 DANGER WIPE BUTTON */}
                {historyAgendas.length > 0 && (
                    <button
                        onClick={handleClearAllHistory}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear All History Logs</span>
                    </button>
                )}
            </div>

            {/* Flash Messages */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 font-medium">{successMsg}</div>}

            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading historical archives...</div>
            ) : historyAgendas.length === 0 ? (
                <div className="bg-white rounded-xl text-center py-12 text-gray-500 text-sm border border-gray-200 shadow-inner">
                    📁 Archive vault khali hai bhao! Koi bhi historical record yahan nahi mila.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {historyAgendas.map((agenda) => (
                        <div key={agenda._id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-4 opacity-90 relative overflow-hidden">
                            
                            <div className="absolute right-[-15px] top-[-15px] text-green-100 pointer-events-none">
                                <CheckCircle2 className="h-24 w-24 opacity-20" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 mb-3">
                                    <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-green-200 uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Status: Completed
                                    </span>
                                    <span className="text-xs font-medium text-gray-400">
                                        Panel: <strong className="text-gray-600 uppercase">{agenda.panel}</strong>
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-gray-500 line-through decoration-gray-400/70 leading-tight">{agenda.title}</h3>
                                <p className="text-xs text-gray-500 mt-2 bg-white/80 p-2.5 rounded-xl border border-gray-100 whitespace-pre-line">{agenda.description}</p>
                            </div>

                            {agenda.meetingNotes && (
                                <div className="bg-blue-50/50 border border-blue-100 text-slate-700 rounded-xl p-2.5 text-xs">
                                    <strong className="flex items-center gap-1 text-blue-800 mb-0.5">
                                        <MessageSquare className="h-3 w-3" /> Final Resolution Passed:
                                    </strong>
                                    {agenda.meetingNotes}
                                </div>
                            )}

                            {/* Operational Execution Logs Array */}
                            <div className="bg-white border border-gray-200 p-3 rounded-xl space-y-2 max-h-[120px] overflow-y-auto">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-blue-500" /> Operational Execution Logs Array
                                </h4>
                                {(!agenda.sewaUpdates || agenda.sewaUpdates.length === 0) ? (
                                    <p className="text-[11px] text-gray-400 italic">Direct close template without middle logs.</p>
                                ) : (
                                    <div className="space-y-2 border-l-2 border-blue-200 pl-2 ml-1">
                                        {agenda.sewaUpdates.map((update, idx) => (
                                            <div key={idx} className="text-[11px] leading-tight text-gray-600">
                                                <span className="font-bold text-gray-800 capitalize">{update.updatedBy}: </span>
                                                <span>{update.text}</span>
                                                <span className="text-[9px] text-gray-400 block mt-0.5">
                                                    {new Date(update.updatedAt).toLocaleDateString()} - {new Date(update.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t border-gray-200/60 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-gray-400" />
                                    <span>Owner: <strong className="capitalize text-gray-700">{agenda.responsiblePerson || 'None'}</strong></span>
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span>Closed: <strong>{new Date(agenda.updatedAt).toLocaleDateString()}</strong></span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SewaHistoryArchives;