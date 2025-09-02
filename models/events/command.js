const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
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
  command_id: String,
  machine_active: String
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  },
  collection: 'command'
});

// Simple index for device queries
commandSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Command', commandSchema);
