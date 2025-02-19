const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { User, Document, CreditRequest } = require('../models');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Document,
                    as: 'documents',
                    attributes: ['id', 'filename', 'processingStatus', 'createdAt']
                },
                {
                    model: CreditRequest,
                    as: 'creditRequests',
                    attributes: ['id', 'requestedCredits', 'status', 'reason', 'adminResponse', 'createdAt', 'updatedAt']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                credits: user.credits,
                role: user.role,
                documents: user.documents,
                creditRequests: user.creditRequests
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
        const updates = {};

        if (password) {
            updates.password = password;
        }

        await req.user.update(updates);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 