// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['member', 'admin', 'tmc', 'zmt'], 
        default: 'member' 
    },
    department: {
        type: String,
        enum: ['General', 'Kitchen', 'Maintenance', 'Outreach'],
        default: 'General'
    },

    isApproved: { type: Boolean, default: false }
}, { timestamps: true }); // Isse 'createdAt' aur 'updatedAt' automatically manage hoga

module.exports = mongoose.model('User', UserSchema);