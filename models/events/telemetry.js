const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
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
  serial_no: String,
  set_liters: String,
  remaining_litters: String,
  location_code: String
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  },
  collection: 'telemetry'
});

// Simple index for device queries
telemetrySchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
