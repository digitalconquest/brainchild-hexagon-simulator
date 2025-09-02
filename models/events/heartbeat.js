const mongoose = require('mongoose');

const heartbeatSchema = new mongoose.Schema({
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
  device_status: String,
  network: {
    signal_strength: Number,
    network_type: String,
    mac_address: String,
    ip_address: String
  },
  firmware: {
    version: String
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  },
  collection: 'heartbeat'
});

// Simple index for device queries
heartbeatSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Heartbeat', heartbeatSchema);
