// backend/models/Agenda.js
const mongoose = require('mongoose');

const AgendaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 👈 Connected to our new User model
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'discussed', 'rejected', 'completed'],
        default: 'pending'
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'medium' 
    },
    panel: { 
        type: String, 
        enum: ['ZMT', 'TMC'], 
        required: true 
    },
    meetingNotes: {
        type: String,
        default: ''
    },
    responsiblePerson: {
        type: String,
        default: 'Not Assigned'
    },
    department: {
        type: String,
        enum: ['General', 'Kitchen', 'Maintenance', 'Outreach', 'Accounts', 'Bhishma', 'Dieties', 'Sankirtan'],
        default: 'General'
    },
    dueDate: { 
        type: Date,
        default: null
    },
    sewaUpdates: [{
        text: { type: String, required: true },
        updatedBy: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Agenda', AgendaSchema);