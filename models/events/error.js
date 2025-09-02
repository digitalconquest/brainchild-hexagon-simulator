const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
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
  error_code: String,
  severity: String,
  message: String
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  },
  collection: 'error'
});

// Simple index for device queries
errorSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Error', errorSchema);
