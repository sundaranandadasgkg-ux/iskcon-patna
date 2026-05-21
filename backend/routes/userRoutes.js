// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// backend/routes/users.js - REGISTRATION ROUTE FIX
router.post('/register', async (req, res) => {
    try {
        console.log("Registering user with secure password hashing...");
        const { name, email, password, role, department } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists bhao!' });
        }

        // 2. Create User Instance
        user = new User({
            name,
            email,
            password, // Isko abhi hum niche encrypt karenge
            role: role || 'member',
            department: department || 'General',
            isApproved: false // Strict hold, admin approve karega
        });

        // 3. 🔥 PASSWORD ENCRYPTION CORE (Yeh missing tha bhao!)
        // Agar aapke User model me pre-save hook nahi chal raha, toh ye line password ko encrypt kar degi
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Save to Database
        await user.save();
        console.log(`User ${email} registered with hashed password successfully!`);

        return res.status(201).json({
            success: true,
            msg: 'Registration successful! Please wait for Admin approval.'
        });

    } catch (err) {
        console.error("🔴 Registration Hashing Error:", err.message);
        return res.status(500).json({ 
            success: false, 
            msg: 'Server error during encryption setup', 
            error: err.message 
        });
    }
});

// 🔑 2. LOGIN USER (Public)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // User ko email se dhoondhein
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Galat Email ya Password" });
        }

        // Password match karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Galat Email ya Password" });
        }

        // backend/routes/userRoutes.js ke login route ke andar password match hone ke BAAD ye jodein:

        if (!user.isApproved) {
            return res.status(403).json({ msg: "hare krishna your account is still pending for approval. kindly ask the concerned authority for approval." });
        }

        // Token pass karein
        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error in Login");
    }
});

// 👤 3. GET CURRENT USER DATA (Protected - Token mandatory)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Password chhupa kar baki data bhejenge
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error fetching user data");
    }
});

// backend/routes/userRoutes.js ke aakhiri me module.exports se thik PHLE ye jodein:

// 👑 ADMIN ONLY: UPDATE USER STATUS OR ROLE
router.patch('/admin/user-control/:id', async (req, res) => {
    const { isApproved, role } = req.body;
    try {
        const user = await require('../models/User').findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User nahi mila" });

        if (isApproved !== undefined) user.isApproved = isApproved;
        if (role) user.role = role;

        await user.save();
        res.json({ msg: "User status updated successfully!" });
    } catch (err) {
        res.status(500).send("Server Error updating user");
    }
});

// backend/routes/userRoutes.js mein patch route se thik PHELE ise jodein:

// 👑 ADMIN ONLY: GET ALL REGISTERED USERS LIST
router.get('/admin/all-users', async (req, res) => {
    try {
        const User = require('../models/User');
        // Saare users nikalenge, bas password hidden rakhenge
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send("Server Error fetching all users");
    }
});



// Admin Delete User Route
router.delete('/delete-user/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User nahi mila bhao!' });
        
        res.status(200).json({ success: true, msg: 'User successfully deleted from system.' });
    } catch (err) {
        res.status(500).json({ msg: 'Delete karne me error aaya.' });
    }
});

module.exports = router;