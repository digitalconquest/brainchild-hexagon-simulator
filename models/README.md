# Models Index

This directory contains all the database models for the Hexagon IoT Backend.

## Usage

Import models using the index file:

```javascript
// Import all models
const { Machine, MachineModel, Telemetry, Heartbeat } = require('./models');

// Or import specific models
const { Machine } = require('./models');
```

## Available Models

### Core Models
- **Machine**: Individual machine instances
- **MachineModel**: Machine model templates/specifications

### Event Models
- **Telemetry**: Machine telemetry data
- **Heartbeat**: Machine heartbeat events
- **Error**: Error events
- **Acknowledgment**: Command acknowledgments
- **Configuration**: Configuration events
- **Command**: Command events

## Model Relationships

- `Machine` → `MachineModel` (Many-to-One)
- Event models are independent and can reference machines by ID

## Example Usage

```javascript
const { Machine, MachineModel } = require('./models');

// Create a machine model
const model = new MachineModel({
  name: 'Water Vending Machine Pro',
  category: 'Water Vending',
  price: 5000,
  description: 'Advanced water vending machine'
});

// Create a machine instance
const machine = new Machine({
  model: model._id,
  machine_no: 'WM001',
  serial_no: 'SN123456789'
});
```
