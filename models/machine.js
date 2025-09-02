const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MachineModel',
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
machineSchema.index({ deviceId: 1 });
machineSchema.index({ model: 1 });
machineSchema.index({ active: 1 });

// Virtual to populate model details
machineSchema.virtual('modelDetails', {
  ref: 'MachineModel',
  localField: 'model',
  foreignField: '_id',
  justOne: true
});

// Static method to find machines by model
machineSchema.statics.findByModel = function(modelId) {
  return this.find({ model: modelId, active: true }).populate('model');
};

// Static method to find active machines
machineSchema.statics.findActive = function() {
  return this.find({ active: true }).populate('model');
};

// Static method to find machine by machine number
machineSchema.statics.findByDeviceId = function(deviceId) {
  return this.findOne({ deviceId: deviceId.toUpperCase() }).populate('model');
};

// Instance method to deactivate machine
machineSchema.methods.deactivate = function() {
  this.active = false;
  return this.save();
};

// Instance method to activate machine
machineSchema.methods.activate = function() {
  this.active = true;
  return this.save();
};

module.exports = mongoose.model('Machine', machineSchema);
