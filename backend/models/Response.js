const mongoose = require('mongoose');

const fieldResponseSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldType: { type: String, required: true },
  label: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed, // Can be string, array, number, etc.
  required: { type: Boolean, default: false }
});

const responseSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  responses: [fieldResponseSchema],
  submittedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  // User identification (required for authenticated submissions)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true // Now required for all submissions
  },
  // Metadata
  timeSpent: Number, // Time spent filling the form in seconds
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  browser: String,
  os: String
});

// Index for better query performance
responseSchema.index({ formId: 1, submittedAt: -1 });
responseSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Response', responseSchema); 