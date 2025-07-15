const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to set cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // Return user data (without password)
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toPublicJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// POST /api/auth/check-user - Check if user exists before login
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection not available',
        message: 'Please try again in a few moments'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('_id name email isActive createdAt');
    
    if (!user) {
      return res.status(404).json({ 
        exists: false,
        message: 'User not found with this email address.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        exists: true,
        active: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    res.json({
      exists: true,
      active: true,
      message: 'User found and account is active.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Check user error:', error);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Unable to check user. Please try again.'
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to check user existence.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection not available',
        message: 'Please try again in a few moments'
      });
    }

    // Find user with enhanced error handling
    let user;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.error('Database error finding user:', dbError);
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Unable to verify user credentials'
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password.',
        message: 'No user found with this email address.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated.',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password with enhanced error handling
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (passwordError) {
      console.error('Password verification error:', passwordError);
      return res.status(500).json({ 
        error: 'Authentication error',
        message: 'Unable to verify password. Please try again.'
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password.',
        message: 'Incorrect password for this email address.'
      });
    }

    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (updateError) {
      console.error('Error updating last login:', updateError);
      // Don't fail login if last login update fails
    }

    // Generate token
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user: user.toPublicJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error.message);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Unable to connect to database. Please try again.'
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to process login request.'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken.' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // Verify current password
    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// GET /api/auth/profile/forms - Get user profile with forms details
router.get('/profile/forms', auth, async (req, res) => {
  try {
    const Form = require('../models/Form');
    const Response = require('../models/Response');

    // Get user's forms
    const forms = await Form.find({ userId: req.user._id, isActive: true })
      .sort({ updatedAt: -1 });

    // Get forms with submission counts and recent activity
    const formsWithDetails = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        
        // Get last submission date
        const lastSubmission = await Response.findOne({ formId: form._id })
          .sort({ submittedAt: -1 })
          .select('submittedAt');

        // Get recent submissions (last 5)
        const recentSubmissions = await Response.find({ formId: form._id })
          .sort({ submittedAt: -1 })
          .limit(5)
          .select('submittedAt ipAddress deviceType');

        return {
          _id: form._id,
          title: form.title,
          description: form.description,
          theme: form.theme,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          responseCount,
          lastSubmission: lastSubmission?.submittedAt || null,
          recentSubmissions,
          fieldCount: form.fields.length,
          isActive: form.isActive
        };
      })
    );

    // Calculate overall statistics
    const totalForms = forms.length;
    const totalResponses = await Response.countDocuments({
      formId: { $in: forms.map(f => f._id) }
    });

    // Get user's activity summary
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Response.find({
      formId: { $in: forms.map(f => f._id) },
      submittedAt: { $gte: thirtyDaysAgo }
    })
      .populate('formId', 'title')
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('formId submittedAt ipAddress deviceType');

    // Get forms by creation date (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const formsByMonth = await Form.aggregate([
      {
        $match: {
          userId: req.user._id,
          isActive: true,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      user: req.user.toPublicJSON(),
      forms: formsWithDetails,
      statistics: {
        totalForms,
        totalResponses,
        averageResponsesPerForm: totalForms > 0 ? Math.round(totalResponses / totalForms) : 0,
        formsByMonth
      },
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching user profile with forms:', error);
    res.status(500).json({ error: 'Failed to fetch user profile with forms.' });
  }
});

module.exports = router; 