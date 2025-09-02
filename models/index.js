// Export all models from the models directory

// Core models
const Machine = require('./machine');
const MachineModel = require('./machineModel');

// Event models (direct imports from events subdirectory)
const Telemetry = require('./events/telemetry');
const Heartbeat = require('./events/heartbeat');
const Error = require('./events/error');
const Acknowledgment = require('./events/acknowledgment');
const Configuration = require('./events/configuration');
const Command = require('./events/command');

// Export all models in a single object
module.exports = {
  // Core models
  Machine,
  MachineModel,
  
  // Event models
  Telemetry,
  Heartbeat,
  Error,
  Acknowledgment,
  Configuration,
  Command
};
