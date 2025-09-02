const mongoose = require('mongoose');

const acknowledgmentSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  modelSeries: {
    type: String,
    required: true
  },
  reference_id: String,
  reference_type: String,
  status: String,
  execution_time: Date,
  result: {
    success: Boolean,
    message: String,
    duration_seconds: Number
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  },
  collection: 'acknowledgment'
});

// Simple index for device queries
acknowledgmentSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Acknowledgment', acknowledgmentSchema);
