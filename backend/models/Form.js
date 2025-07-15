const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'phone', 'url', 'rating', 'toggle']
  },
  label: { type: String, required: true },
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String], // For select, radio, checkbox fields
  validation: {
    min: Number,
    max: Number,
    pattern: String
  },
  order: { type: Number, default: 0 }
});

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fields: [fieldSchema],
  theme: {
    type: String,
    enum: ['default', 'dark', 'light', 'blue', 'green', 'purple'],
    default: 'default'
  },
  deadline: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    default: '',
    index: true
  },
  settings: {
    allowMultipleResponses: { type: Boolean, default: true },
    requireAuthentication: { type: Boolean, default: false },
    showProgressBar: { type: Boolean, default: true },
    submitButtonText: { type: String, default: 'Submit' },
    successMessage: { type: String, default: 'Thank you for your response!' }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
formSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Form', formSchema); 