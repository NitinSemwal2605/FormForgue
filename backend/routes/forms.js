const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');
const { auth } = require('../middleware/auth');

// GET public form by ID (no authentication required)
router.get('/public/:id', async (req, res) => {
  try {
    console.log('Fetching public form with ID:', req.params.id);
    
    const form = await Form.findOne({ _id: req.params.id, isActive: true });
    
    if (!form) {
      console.log('Public form not found:', req.params.id);
      return res.status(404).json({ error: 'Form not found or no longer accepting responses' });
    }
    
    console.log('Public form found:', form.title);
    
    // Return form data without sensitive information
    res.json({
      _id: form._id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      theme: form.theme,
      settings: form.settings,
      createdAt: form.createdAt
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to load form',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error'
    });
  }
});

// GET all forms for the authenticated user with submission counts
router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id, isActive: true })
      .select('title description theme createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    // Get submission counts for each form
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        return {
          ...form.toObject(),
          responseCount
        };
      })
    );
    
    res.json(formsWithStats);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// GET user's forms dashboard with detailed statistics
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    console.log('Dashboard stats request for user:', req.user._id);
    
    // Get all user's forms
    const forms = await Form.find({ userId: req.user._id, isActive: true });
    console.log('Found forms:', forms.length);
    
    // Calculate overall statistics
    const totalForms = forms.length;
    let totalResponses = 0;
    try {
      totalResponses = await Response.countDocuments({
        formId: { $in: forms.map(f => f._id) }
      });
    } catch (error) {
      console.error('Error counting total responses:', error);
      totalResponses = 0;
    }
    
    // Get recent forms (last 5)
    const recentForms = await Form.find({ userId: req.user._id, isActive: true })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get forms with most responses
    let formsWithResponseCounts = [];
    try {
      formsWithResponseCounts = await Promise.all(
        forms.map(async (form) => {
          try {
            const responseCount = await Response.countDocuments({ formId: form._id });
            return {
              _id: form._id,
              title: form.title,
              responseCount,
              createdAt: form.createdAt
            };
          } catch (error) {
            console.error(`Error counting responses for form ${form._id}:`, error);
            return {
              _id: form._id,
              title: form.title,
              responseCount: 0,
              createdAt: form.createdAt
            };
          }
        })
      );
    } catch (error) {
      console.error('Error getting forms with response counts:', error);
      formsWithResponseCounts = forms.map(form => ({
        _id: form._id,
        title: form.title,
        responseCount: 0,
        createdAt: form.createdAt
      }));
    }
    
    const topForms = formsWithResponseCounts
      .sort((a, b) => b.responseCount - a.responseCount)
      .slice(0, 5);
    
    // Get recent responses (last 10)
    let recentResponses = [];
    try {
      recentResponses = await Response.find({
        formId: { $in: forms.map(f => f._id) }
      })
        .populate('formId', 'title')
        .sort({ submittedAt: -1 })
        .limit(10)
        .select('formId submittedAt ipAddress deviceType');
    } catch (error) {
      console.error('Error fetching recent responses:', error);
      recentResponses = [];
    }
    
    res.json({
      totalForms,
      totalResponses,
      recentForms,
      topForms,
      recentResponses
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET detailed form information with submissions
router.get('/:id/details', auth, async (req, res) => {
  try {
    // Ensure user owns the form
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get form statistics
    const totalResponses = await Response.countDocuments({ formId: req.params.id });
    
    // Get recent responses
    const recentResponses = await Response.find({ formId: req.params.id })
      .sort({ submittedAt: -1 })
      .limit(10);
    
    // Get response analytics
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
      form: form.toObject(),
      statistics: {
        totalResponses,
        deviceStats,
        browserStats,
        dailyResponses
      },
      recentResponses
    });
  } catch (error) {
    console.error('Error fetching form details:', error);
    res.status(500).json({ error: 'Failed to fetch form details' });
  }
});

// GET form submissions with pagination
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Ensure user owns the form
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get submissions with pagination
    const submissions = await Response.find({ formId: req.params.id })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalSubmissions = await Response.countDocuments({ formId: req.params.id });

    // Format submissions with field details
    const formattedSubmissions = submissions.map(submission => {
      const formattedResponses = submission.responses.map(response => {
        const field = form.fields.find(f => f.id === response.fieldId);
        return {
          ...response.toObject(),
          fieldType: field ? field.type : response.fieldType,
          fieldLabel: field ? field.label : response.label
        };
      });

      return {
        _id: submission._id,
        responses: formattedResponses,
        submittedAt: submission.submittedAt,
        ipAddress: submission.ipAddress,
        userAgent: submission.userAgent,
        deviceType: submission.deviceType,
        browser: submission.browser,
        os: submission.os,
        timeSpent: submission.timeSpent
      };
    });

    res.json({
      submissions: formattedSubmissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSubmissions / limit),
        totalSubmissions,
        hasNextPage: page * limit < totalSubmissions,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// GET single form by ID (user can only access their own forms)
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching form with ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!form) {
      console.log('Form not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Form not found' });
    }
    
    console.log('Form found:', form.title);
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch form',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error'
    });
  }
});

// POST create new form
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, fields, theme, settings, deadline, category } = req.body;
    
    // Validate required fields
    if (!title || !fields || fields.length === 0) {
      return res.status(400).json({ 
        error: 'Title and at least one field are required' 
      });
    }

    // Create new form
    const form = new Form({
      userId: req.user._id,
      title,
      description,
      fields: fields.map((field, index) => ({
        ...field,
        order: index
      })),
      theme,
      settings,
      deadline: deadline || null,
      category: category || ''
    });

    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// PUT update form
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, fields, theme, settings, deadline, category } = req.body;
    
    // Find form and ensure user owns it
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Update form
    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        fields: fields.map((field, index) => ({
        ...field,
        order: index
        })),
        theme,
        settings,
        deadline: deadline || null,
        category: category || '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// DELETE form (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find form and ensure user owns it
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Soft delete by setting isActive to false
    await Form.findByIdAndUpdate(req.params.id, { 
      isActive: false,
      updatedAt: new Date()
    });
    
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// GET form statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    console.log('Fetching stats for form ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    // Ensure user owns the form
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
    if (!form) {
      console.log('Form not found for stats:', req.params.id);
      return res.status(404).json({ error: 'Form not found' });
    }

    const responseCount = await Response.countDocuments({ formId: req.params.id });

    const stats = {
      formId: form._id,
      title: form.title,
      totalResponses: responseCount,
      createdAt: form.createdAt,
      lastUpdated: form.updatedAt
    };

    console.log('Stats calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching form stats:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch form statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error'
    });
  }
});

// GET user's forms management dashboard
router.get('/management/overview', auth, async (req, res) => {
  try {
    // Get all user's forms with detailed analytics
    const forms = await Form.find({ userId: req.user._id, isActive: true })
      .sort({ updatedAt: -1 });

    // Get comprehensive analytics for each form
    const formsWithAnalytics = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        
        // Get today's responses
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayResponses = await Response.countDocuments({
          formId: form._id,
          submittedAt: { $gte: today }
        });

        // Get this week's responses
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekResponses = await Response.countDocuments({
          formId: form._id,
          submittedAt: { $gte: weekAgo }
        });

        // Get this month's responses
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthResponses = await Response.countDocuments({
          formId: form._id,
          submittedAt: { $gte: monthAgo }
        });

        // Get last submission
        const lastSubmission = await Response.findOne({ formId: form._id })
          .sort({ submittedAt: -1 })
          .select('submittedAt');

        // Get device distribution
        const deviceStats = await Response.aggregate([
          { $match: { formId: form._id } },
          { $group: { _id: '$deviceType', count: { $sum: 1 } } }
        ]);

        // Get average time spent
        const avgTimeSpent = await Response.aggregate([
          { $match: { formId: form._id, timeSpent: { $exists: true, $ne: null } } },
          { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
        ]);

        return {
          _id: form._id,
          title: form.title,
          description: form.description,
          theme: form.theme,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          fieldCount: form.fields.length,
          analytics: {
            totalResponses: responseCount,
            todayResponses,
            weekResponses,
            monthResponses,
            lastSubmission: lastSubmission?.submittedAt || null,
            deviceStats,
            avgTimeSpent: avgTimeSpent[0]?.avgTime || 0
          }
        };
      })
    );

    // Calculate overall user statistics
    const totalForms = forms.length;
    const totalResponses = await Response.countDocuments({
      formId: { $in: forms.map(f => f._id) }
    });

    // Get user's form creation trend
    const creationTrend = await Form.aggregate([
      {
        $match: {
          userId: req.user._id,
          isActive: true
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

    // Get top performing forms
    const topForms = formsWithAnalytics
      .sort((a, b) => b.analytics.totalResponses - a.analytics.totalResponses)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = await Response.find({
      formId: { $in: forms.map(f => f._id) }
    })
      .populate('formId', 'title')
      .sort({ submittedAt: -1 })
      .limit(15)
      .select('formId submittedAt ipAddress deviceType browser');

    res.json({
      forms: formsWithAnalytics,
      overview: {
        totalForms,
        totalResponses,
        averageResponsesPerForm: totalForms > 0 ? Math.round(totalResponses / totalForms) : 0,
        creationTrend,
        topForms,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching forms management overview:', error);
    res.status(500).json({ error: 'Failed to fetch forms management overview' });
  }
});

// GET form analytics with detailed insights
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    console.log('Analytics request for form ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        error: 'Database connection not available',
        message: 'Please try again in a few moments'
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid form ID format' });
    }
    
    // Ensure user owns the form
    let form;
    try {
      form = await Form.findOne({ _id: req.params.id, userId: req.user._id });
      if (!form) {
        console.log('Form not found or user does not own it');
        return res.status(404).json({ error: 'Form not found' });
      }
    } catch (dbError) {
      console.error('Database error finding form:', dbError);
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Unable to fetch form data'
      });
    }

    console.log('Form found:', form.title);
    
    // Get basic statistics
    let totalResponses = 0;
    try {
      totalResponses = await Response.countDocuments({ formId: req.params.id });
      console.log('Total responses:', totalResponses);
    } catch (countError) {
      console.error('Error counting responses:', countError);
      totalResponses = 0;
    }

    // Get response trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let dailyTrends = [];
    try {
      dailyTrends = await Response.aggregate([
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
    } catch (error) {
      console.error('Error in daily trends aggregation:', error);
      dailyTrends = [];
    }

    // Get device and browser statistics
    let deviceStats = [];
    try {
      deviceStats = await Response.aggregate([
        { $match: { formId: form._id } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } }
      ]);
    } catch (error) {
      console.error('Error in device stats aggregation:', error);
      deviceStats = [];
    }

    let browserStats = [];
    try {
      browserStats = await Response.aggregate([
        { $match: { formId: form._id } },
        { $group: { _id: '$browser', count: { $sum: 1 } } }
      ]);
    } catch (error) {
      console.error('Error in browser stats aggregation:', error);
      browserStats = [];
    }

    // Get time-based analytics
    let hourlyDistribution = [];
    try {
      hourlyDistribution = await Response.aggregate([
        { $match: { formId: form._id } },
        {
          $group: {
            _id: { $hour: '$submittedAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    } catch (error) {
      console.error('Error in hourly distribution aggregation:', error);
      hourlyDistribution = [];
    }

    // Get field-specific analytics
    let fieldAnalytics = [];
    try {
      fieldAnalytics = await Promise.all(
        form.fields.map(async (field) => {
          try {
            const fieldResponses = await Response.aggregate([
              { $match: { formId: form._id } },
              { $unwind: '$responses' },
              { $match: { 'responses.fieldId': field.id } },
              { $group: { _id: '$responses.value', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ]);

            return {
              fieldId: field.id,
              fieldLabel: field.label,
              fieldType: field.type,
              responseCount: fieldResponses.length,
              topResponses: fieldResponses
            };
          } catch (error) {
            console.error(`Error in field analytics for field ${field.id}:`, error);
            return {
              fieldId: field.id,
              fieldLabel: field.label,
              fieldType: field.type,
              responseCount: 0,
              topResponses: []
            };
          }
        })
      );
    } catch (error) {
      console.error('Error in field analytics:', error);
      fieldAnalytics = [];
    }

    // Get completion rate (if timeSpent is available)
    let completionStats = null;
    try {
      completionStats = await Response.aggregate([
        { $match: { formId: form._id, timeSpent: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avgTimeSpent: { $avg: '$timeSpent' },
            minTimeSpent: { $min: '$timeSpent' },
            maxTimeSpent: { $max: '$timeSpent' },
            totalCompletions: { $sum: 1 }
          }
        }
      ]);
    } catch (error) {
      console.error('Error in completion stats aggregation:', error);
      completionStats = null;
    }

    res.json({
      form: {
        _id: form._id,
        title: form.title,
        description: form.description,
        fieldCount: form.fields.length,
        createdAt: form.createdAt
      },
      analytics: {
        totalResponses,
        dailyTrends,
        deviceStats,
        browserStats,
        hourlyDistribution,
        fieldAnalytics,
        completionStats: completionStats[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching form analytics:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a database connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Unable to connect to database. Please try again.'
      });
    }
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: error.message
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// GET test route to verify forms API
router.get('/test', auth, async (req, res) => {
  try {
    res.json({
      message: 'Forms API is working correctly',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: 'Test route failed' });
  }
});

// GET database health check
router.get('/health/db', auth, async (req, res) => {
  try {
    const dbStatus = {
      connectionState: mongoose.connection.readyState,
      connectionStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    };
    
    // Test a simple database operation
    let dbTest = 'failed';
    try {
      await Form.countDocuments({});
      dbTest = 'success';
    } catch (testError) {
      console.error('Database test failed:', testError);
      dbTest = 'failed';
    }
    
    res.json({
      status: 'OK',
      database: dbStatus,
      test: dbTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 