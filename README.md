# Hexagon MQTT Simulator

A Node.js microservice for simulating MQTT communication with Hexagon water vending machines IoT devices.

## Features

- MQTT client connection with configurable broker settings
- Express.js REST API server
- Device simulator for publishing device-to-cloud events
- Cloud-to-device message subscription and acknowledgment
- Graceful shutdown handling
- Health check endpoints

## Prerequisites

- Node.js (v14 or higher)
- MQTT broker (e.g., Mosquitto, AWS IoT Core, etc.)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp config.example.env .env
   ```

4. Update the `.env` file with your configuration:
   - MQTT broker details
   - Server port and other settings

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MQTT_HOST`: MQTT broker host
- `MQTT_PORT`: MQTT broker port
- `MQTT_USERNAME`: MQTT username (optional)
- `MQTT_PASSWORD`: MQTT password (optional)
- `MQTT_CLIENT_ID`: MQTT client identifier

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Device Simulator
```bash
# Run the device simulator
npm run simulator

# Run simulator in development mode (with auto-restart)
npm run simulator:dev
```



## API Endpoints

- `GET /` - Service information
- `GET /health` - Health check with connection status

## MQTT Topics

### Device to Cloud (Published by Simulator)
- `hexagon/{deviceId}/heartbeat` - Device heartbeat messages
- `hexagon/{deviceId}/telemetry` - Device telemetry data
- `hexagon/{deviceId}/error` - Device error messages
- `hexagon/{deviceId}/acknowledgment` - Command/configuration acknowledgments

### Cloud to Device (Subscribed by Simulator)
- `hexagon/{deviceId}/command` - Commands sent to devices
- `hexagon/{deviceId}/configuration` - Configuration updates sent to devices

## Data Models

### Core Models
- **Machine**: Device instances with deviceId and model reference
- **MachineModel**: Device model definitions with specifications

### Event Models (Time Series Collections)
- **Heartbeat**: Device connectivity and status information
- **Telemetry**: Real-time device metrics (water levels, location, etc.)
- **Error**: Device error messages with severity levels
- **Acknowledgment**: Responses to commands and configurations
- **Command**: Commands sent from cloud to devices
- **Configuration**: Configuration updates sent from cloud to devices

## Project Structure

```
├── app.js                    # Main application file
├── device-simulator.js       # Device simulator with MQTT publisher/subscriber
├── load-devices.js          # Device loader for real MongoDB data
├── hexagon_smart.machines.json      # Real machine data from MongoDB
├── hexagon_smart.machinemodels.json # Real machine model data from MongoDB
├── models/                   # Schema models for reference
│   ├── index.js             # Model exports
│   ├── machine.js           # Machine model
│   ├── machineModel.js      # Machine model definitions
│   └── events/              # Event models (time series)
│       ├── heartbeat.js     # Heartbeat events
│       ├── telemetry.js     # Telemetry events
│       ├── error.js         # Error events
│       ├── acknowledgment.js # Acknowledgment events
│       ├── command.js       # Command events
│       └── configuration.js # Configuration events
├── config/                  # Configuration files
│   └── database.js          # Database connection (for reference)
├── package.json             # Dependencies and scripts
├── config.example.env       # Environment configuration template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Device Simulator Features

The device simulator (`device-simulator.js`) provides:

#### Device-to-Cloud Publishing
- **Heartbeat**: Every 30 seconds with device status and network info
- **Telemetry**: Every 2 minutes with water levels and location data  
- **Errors**: Random errors (5% chance every 5 minutes)
- **Acknowledgments**: Automatic responses to received commands and configurations
- **Real Device Data**: Uses actual device IDs and modelSeries from MongoDB collections

#### Cloud-to-Device Subscription
- **Command Subscription**: Listens for commands and responds with acknowledgments
- **Configuration Subscription**: Listens for configuration updates and responds with acknowledgments

#### Real Device Management
- Loads real devices from MongoDB collections (8 devices: 12345-12347, 23456-23457, 34567-34569)
- Maps each device to correct modelSeries (hexa_3000pro, hexa_9000ultra, hexa_450prime)
- Uses correct topic patterns with modelSeries for each device
- Message counters and status tracking
- Graceful shutdown handling

## Next Steps

1. **Configure Environment**: Copy `config.example.env` to `.env` and update with your settings
2. **Install Dependencies**: Run `npm install`
3. **Start MQTT Broker**: Set up your MQTT broker (e.g., Mosquitto)
4. **Run Simulator**: Use `npm run simulator` to start the device simulator
5. **Customize**: Modify message generation logic based on your specific requirements

## License

ISC
