// backend/routes/agendaRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agenda = require('../models/Agenda'); // Dono models yahan import hain
const { auth } = require('../middleware/auth'); 

// 🛡️ ROLE CHECK MIDDLEWARE
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ msg: "Access Denied: Admin rights required" });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Aapke paas is action ki permission nahi hai" });
        }
        next();
    };
};

// ======================================================================
// 🚨 DANGER ZONE: Permanent History Wiper Route (Must be ABOVE /:id)
// ======================================================================
router.delete('/clear-history', async (req, res) => {
    try {
        console.log("Wiping all completed history logs directly from MongoDB...");

        // Ekdum direct Mongoose query - No middleware dependency
        const deleteResult = await Agenda.deleteMany({ 
            status: { $in: ['completed', 'done'] } 
        });

        console.log(`Successfully wiped ${deleteResult.deletedCount} items.`);
        
        return res.status(200).json({ 
            success: true, 
            message: `History cleared perfectly!`,
            deletedCount: deleteResult.deletedCount
        });

    } catch (err) {
        console.error("Backend History Wipe Error:", err);
        return res.status(500).json({ 
            success: false, 
            message: 'History clear karne me backend core error aaya.',
            error: err.message 
        });
    }
});

// backend/routes/agendaRoutes.js

// 🚨 ADMIN DELETE AGENDA ROUTE
// Isse /agendas/delete/:id par call karenge
router.delete('/delete/:id', auth, checkAdmin, async (req, res) => {
    try {
        const agenda = await Agenda.findByIdAndDelete(req.params.id);
        
        if (!agenda) {
            return res.status(404).json({ msg: "Agenda nahi mila bhao!" });
        }

        res.json({ success: true, msg: "Agenda successfully delete ho gaya!" });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ msg: "Server error during delete" });
    }
});

// ==========================================
// 👤 USER & AUTH ROUTES (Approval Locked)
// ==========================================

// 1. REGISTER
router.post('/register', async (req, res) => {
    const { name, email, password, role, department } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User pehle se registered hai" });

        user = new User({ name, email, password, role, department, isApproved: false }); 

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(201).json({ msg: "Registration successful! Admin approval ka wait karein." });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        if (!user.isApproved) {
            return res.status(403).json({ msg: "Aapka account abhi Admin approval ke liye pending hai bhao!" });
        }

        const payload = { id: user._id, role: user.role };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 3. GET CURRENT USER PROFILE
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 4. UPDATE OWN PROFILE (Name & Password)
router.put('/profile/update', auth, async (req, res) => {
    const { name, password } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json({ msg: "Profile updated successfully!" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 5. ADMIN ONLY: GET ALL USERS
router.get('/admin/all-users', auth, checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});




// ==========================================
// 📋 AGENDA CORE OPERATIONS ROUTES
// ==========================================

// 6. ADMIN ONLY: APPROVE/TOGGLE STATUS OR CHANGE ROLE
router.patch('/admin/user-control/:id', auth, checkAdmin, async (req, res) => {
    const { isApproved, role, department } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User nahi mila" });

        if (isApproved !== undefined) user.isApproved = isApproved;
        if (role) user.role = role;
        if (department) user.department = department;

        await user.save();
        res.json({ msg: "User dashboard updated by Admin!" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 1. CREATE NEW AGENDA
router.post('/create', auth, async (req, res) => {
    const { title, description, priority, panel, department } = req.body;
    if (!title || !description) {
        return res.status(400).json({ msg: "Title aur Description compulsory hain bhai!" });
    }
    try {
        const newAgenda = new Agenda({
            title,
            description,
            submittedBy: req.user.id,
            priority: priority || 'medium',
            panel: panel || 'TMC',
            department: department || 'General'
        });
        const agenda = await newAgenda.save();
        res.status(201).json(agenda);
    } catch (err) {
        console.error("Backend Error:", err.message);
        res.status(500).send("Server Error creating agenda");
    }
});

// 2. GET ALL AGENDAS (Meeting Floor & Dashboard Fix)
router.get('/all', auth, async (req, res) => {
    try {
        const agendas = await Agenda.find()
            .populate('submittedBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json(agendas);
    } catch (err) {
        res.status(500).send("Server Error fetching agendas");
    }
});

// 3. UPDATE AGENDA DETAILS FROM MEETING FLOOR
router.patch('/meeting-floor/:id', auth, checkRole(['admin', 'tmc', 'zmt']), async (req, res) => {
    const { status, meetingNotes, responsiblePerson, dueDate } = req.body;
    try {
        let agenda = await Agenda.findById(req.params.id);
        if (!agenda) return res.status(404).json({ msg: "Agenda nahi mila" });

        if (status) agenda.status = status;
        if (meetingNotes !== undefined) agenda.meetingNotes = meetingNotes;
        if (responsiblePerson !== undefined) agenda.responsiblePerson = responsiblePerson;
        if (dueDate) agenda.dueDate = dueDate;

        await agenda.save();
        res.json(agenda);
    } catch (err) {
        res.status(500).send("Server Error updating meeting floor");
    }
});

// 1. MEETING FLOOR ROUTE: Sirf 'approved' status waale items yahan dikhenge!
router.get('/meeting-floor', auth, async (req, res) => {
    try {
        // Jaise hi status 'approved' se badalkar 'discussed' hoga, automatic yahan se disappear!
        const agendas = await Agenda.find({ status: 'approved' })
            .populate('submittedBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json(agendas);
    } catch (err) {
        res.status(500).send("Server Error fetching meeting floor data");
    }
});

// 2. MAIN DASHBOARD ROUTE: Sirf 'discussed' status waale active items (Sewa Workspace)
router.get('/dashboard-active', auth, async (req, res) => {
    try {
        // Yahan responsible person apni sewa progress updates array me push karega
        const agendas = await Agenda.find({ status: 'discussed' })
            .populate('submittedBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json(agendas);
    } catch (err) {
        res.status(500).send("Server Error fetching dashboard data");
    }
});

// 3. HISTORY ROUTE: Sirf 'completed' ya 'done' waale items
router.get('/history', auth, async (req, res) => {
    try {
        const agendas = await Agenda.find({ status: { $in: ['completed', 'done'] } })
            .populate('submittedBy', 'name email role')
            .sort({ updatedAt: -1 });
        res.json(agendas);
    } catch (err) {
        res.status(500).send("Server Error fetching history data");
    }
});

// 4. SEWA PROGRESS UPDATE POST LOG ROUTE
router.post('/sewa-update/:id', auth, async (req, res) => {
    const { text, updatedBy } = req.body;
    if (!text) return res.status(400).json({ msg: "Log text mandatory hai bhao" });

    try {
        let agenda = await Agenda.findById(req.params.id);
        if (!agenda) return res.status(404).json({ msg: "Agenda nahi mila" });

        agenda.sewaUpdates.push({ text, updatedBy });
        await agenda.save();
        res.json(agenda);
    } catch (err) {
        res.status(500).send("Server error saving sewa log");
    }
});




module.exports = router;