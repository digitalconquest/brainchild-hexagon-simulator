const mongoose = require('mongoose');

const machineModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  alias: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
machineModelSchema.index({ name: 1 });
machineModelSchema.index({ alias: 1 });
machineModelSchema.index({ category: 1 });
machineModelSchema.index({ status: 1 });

// Pre-save middleware to generate alias from name
machineModelSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.alias) {
    this.alias = this.name.toLowerCase().replace(/\s+/g, '_');
  }
  next();
});

// Static method to find models by category
machineModelSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: true });
};

// Static method to find active models
machineModelSchema.statics.findActive = function() {
  return this.find({ status: true });
};

module.exports = mongoose.model('MachineModel', machineModelSchema);
