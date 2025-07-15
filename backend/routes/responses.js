const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Response = require('../models/Response');
const Form = require('../models/Form');
const { auth } = require('../middleware/auth');

// GET all user responses with user details (for analytics)
router.get('/all', auth, async (req, res) => {
  try {
    console.log('Fetching all user responses for analytics');
    
    // Get all forms created by the user
    const userForms = await Form.find({ userId: req.user._id, isActive: true });
    const formIds = userForms.map(form => form._id);
    
    // Get all responses for user's forms with user details
    const responses = await Response.find({ 
      formId: { $in: formIds },
      userId: { $exists: true, $ne: null } // Only responses with user IDs
    })
    .populate('userId', 'name email')
    .populate('formId', 'title')
    .sort({ submittedAt: -1 })
    .limit(100); // Limit to recent 100 responses
    
    // Format responses for frontend
    const formattedResponses = responses.map(response => ({
      _id: response._id,
      user: response.userId ? {
        name: response.userId.name,
        email: response.userId.email
      } : null,
      formTitle: response.formId ? response.formId.title : 'Unknown Form',
      responses: response.responses,
      submittedAt: response.submittedAt,
      deviceType: response.deviceType,
      browser: response.browser,
      ipAddress: response.ipAddress
    }));
    
    res.json(formattedResponses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    res.status(500).json({ error: 'Failed to fetch user responses' });
  }
});

// GET responses for a specific form with user details
router.get('/form/:formId', auth, async (req, res) => {
  try {
    console.log('Fetching responses for form:', req.params.formId);
    
    // Ensure user owns the form
    const form = await Form.findOne({ _id: req.params.formId, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Get responses for this form with user details
    const responses = await Response.find({ 
      formId: req.params.formId,
      userId: { $exists: true, $ne: null } // Only responses with user IDs
    })
    .populate('userId', 'name email')
    .sort({ submittedAt: -1 });
    
    // Format responses for frontend
    const formattedResponses = responses.map(response => ({
      _id: response._id,
      user: response.userId ? {
        name: response.userId.name,
        email: response.userId.email
      } : null,
      formTitle: form.title,
      responses: response.responses,
      submittedAt: response.submittedAt,
      deviceType: response.deviceType,
      browser: response.browser,
      ipAddress: response.ipAddress
    }));
    
    res.json(formattedResponses);
  } catch (error) {
    console.error('Error fetching form responses:', error);
    res.status(500).json({ error: 'Failed to fetch form responses' });
  }
});

// POST submit form response (requires authentication)
router.post('/submit', auth, async (req, res) => {
  try {
    const { formId, responses, timeSpent } = req.body;
    
    // Validate required fields
    if (!formId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Form ID and responses are required' });
    }
    
    // Check if form exists and is active
    const form = await Form.findOne({ _id: formId, isActive: true });
    if (!form) {
      return res.status(404).json({ error: 'Form not found or no longer accepting responses' });
    }
    
    // Create new response with user ID
    const response = new Response({
      formId,
      userId: req.user._id, // Include user ID
      responses,
      submittedAt: new Date(),
      timeSpent,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceType: getDeviceType(req.get('User-Agent')),
      browser: getBrowser(req.get('User-Agent')),
      os: getOS(req.get('User-Agent'))
    });
    
    const savedResponse = await response.save();
    
    res.status(201).json({
      message: 'Response submitted successfully',
      responseId: savedResponse._id
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// GET single response
router.get('/:id', async (req, res) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('formId', 'title');
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

// Helper functions for device detection
function getDeviceType(userAgent) {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

function getBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  return 'Unknown';
}

function getOS(userAgent) {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Unknown';
}

// GET response analytics for a form
router.get('/analytics/:formId', auth, async (req, res) => {
  try {
    const { formId } = req.params;
    
    // Ensure user owns the form
    const form = await Form.findOne({ _id: formId, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Get response statistics
    const totalResponses = await Response.countDocuments({ formId });
    const responsesWithUsers = await Response.countDocuments({ 
      formId, 
      userId: { $exists: true, $ne: null } 
    });
    
    // Get device and browser statistics
    const deviceStats = await Response.aggregate([
      { $match: { formId: form._id } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);
    
    const browserStats = await Response.aggregate([
      { $match: { formId: form._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } }
    ]);
    
    // Get daily response count for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyResponses = await Response.aggregate([
      { 
        $match: { 
          formId: form._id,
          submittedAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalResponses,
      responsesWithUsers,
      deviceStats,
      browserStats,
      dailyResponses
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router; 