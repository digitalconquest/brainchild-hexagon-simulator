const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
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
  config_id: String,
  pricing: {
    set_liters: String
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  },
  collection: 'configuration'
});

// Simple index for device queries
configurationSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Configuration', configurationSchema);
