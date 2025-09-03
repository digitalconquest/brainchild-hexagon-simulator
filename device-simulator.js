const mqtt = require('mqtt');
require('dotenv').config();
const deviceCredentials = require('./config/device-creds.json');
const fs = require('fs');
const DeviceLoader = require('./load-devices');

class DeviceSimulator {
  constructor() {
    this.mqttClient = null;
    this.deviceLoader = new DeviceLoader();
    this.devices = [];
    this.deviceModelMap = new Map();
    this.simulationActive = false;
    this.intervals = new Map();
    this.messageCounters = new Map();
    
    // MQTT Configuration
    this.mqttOptions = {
      port: 8883,
      username: 'admin',
      password: 'adminpassword',
      clientId: `hexagon-simulator-${Math.random().toString(16).substr(2, 8)}`,
      ca: fs.readFileSync('./config/ca.crt'),
      cert: deviceCredentials.certificate,
      key: deviceCredentials.privateKey,
      clean: true,
      reconnectPeriod: 2000,
      connectTimeout: 30 * 1000,
    };

    // Topic patterns for device-to-cloud events (will be updated with correct modelSeries)
    this.topics = {
      heartbeat: 'hexagon/{modelSeries}/{deviceId}/heartbeat',
      telemetry: 'hexagon/{modelSeries}/{deviceId}/telemetry',
      error: 'hexagon/{modelSeries}/{deviceId}/error',
      acknowledgment: 'hexagon/{modelSeries}/{deviceId}/acknowledgment'
    };

    // Cloud-to-device topics (for subscription only)
    this.cloudTopics = {
      command: 'hexagon/{modelSeries}/{deviceId}/command',
      configuration: 'hexagon/{modelSeries}/{deviceId}/configuration'
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Hexagon Device Simulator...');
      
      // Load real device data
      const deviceData = this.deviceLoader.loadData();
      this.devices = deviceData.devices;
      this.deviceModelMap = deviceData.deviceModelMap;
      
      // Connect to MQTT
      await this.connectMQTT();
      
      console.log('✅ Device Simulator initialized successfully');
      console.log(`📱 Simulating ${this.devices.length} real devices: ${this.devices.join(', ')}`);
      
      // Display device-model mapping
      console.log('🔗 Device-Model Mapping:');
      this.deviceModelMap.forEach((modelSeries, deviceId) => {
        console.log(`   ${deviceId} → ${modelSeries}`);
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize simulator:', error);
      process.exit(1);
    }
  }

  async connectMQTT() {
    return new Promise((resolve, reject) => {
      this.mqttClient = mqtt.connect('mqtts://94.237.72.14', this.mqttOptions);

      this.mqttClient.on('connect', () => {
        console.log('📡 MQTT Client Connected');
        
        // Subscribe to cloud-to-device topics
        this.subscribeToCloudTopics();
        
        resolve();
      });

      this.mqttClient.on('error', (error) => {
        console.error('❌ MQTT Connection Error:', error);
        reject(error);
      });

      this.mqttClient.on('reconnect', () => {
        console.log('🔄 MQTT Client Reconnecting...');
      });

      this.mqttClient.on('message', (topic, message) => {
        this.handleIncomingMessage(topic, message);
      });
    });
  }

  subscribeToCloudTopics() {
    this.devices.forEach(deviceId => {
      const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
      const commandTopic = this.cloudTopics.command.replace('{modelSeries}', modelSeries).replace('{deviceId}', deviceId);
      const configTopic = this.cloudTopics.configuration.replace('{modelSeries}', modelSeries).replace('{deviceId}', deviceId);
      
      [commandTopic, configTopic].forEach(topic => {
        this.mqttClient.subscribe(topic, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err);
          } else {
            console.log(`📥 Subscribed to: ${topic}`);
          }
        });
      });
    });
  }

  handleIncomingMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      const deviceId = topicParts[1];
      const messageType = topicParts[2];
      
      console.log(`📨 Received ${messageType} for device ${deviceId}:`, data);
      
      // Handle different message types
      switch (messageType) {
        case 'command':
          this.handleCommand(deviceId, data);
          break;
        case 'configuration':
          this.handleConfiguration(deviceId, data);
          break;
        default:
          console.log(`⚠️  Unknown message type: ${messageType}`);
      }
      
    } catch (error) {
      console.error('❌ Error parsing incoming message:', error);
    }
  }

  async handleCommand(deviceId, commandData) {
    try {
      console.log(`🎯 Processing command for device ${deviceId}:`, commandData);
      
      // Simulate command processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      // Get correct modelSeries for this device
      const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
      
      // Generate acknowledgment based on schema
      const acknowledgment = {
        timestamp: new Date(),
        deviceId: deviceId,
        modelSeries: modelSeries,
        reference_id: commandData.command_id || `cmd_${Date.now()}`,
        reference_type: 'command',
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        execution_time: new Date(),
        result: {
          success: Math.random() > 0.1,
          message: Math.random() > 0.1 ? 'Command executed successfully' : 'Command execution failed',
          duration_seconds: Math.random() * 5 + 1
        }
      };
      
      // Publish acknowledgment
      this.publishMessage(deviceId, 'acknowledgment', acknowledgment);
      
    } catch (error) {
      console.error(`❌ Error handling command for device ${deviceId}:`, error);
    }
  }

  async handleConfiguration(deviceId, configData) {
    try {
      console.log(`⚙️  Processing configuration for device ${deviceId}:`, configData);
      
      // Simulate configuration processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
      
      // Get correct modelSeries for this device
      const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
      
      // Generate acknowledgment based on schema
      const acknowledgment = {
        timestamp: new Date(),
        deviceId: deviceId,
        modelSeries: modelSeries,
        reference_id: configData.config_id || `config_${Date.now()}`,
        reference_type: 'configuration',
        status: Math.random() > 0.05 ? 'completed' : 'failed',
        execution_time: new Date(),
        result: {
          success: Math.random() > 0.05,
          message: Math.random() > 0.05 ? 'Configuration updated successfully' : 'Configuration update failed',
          duration_seconds: Math.random() * 2 + 0.5
        }
      };
      
      // Publish acknowledgment
      this.publishMessage(deviceId, 'acknowledgment', acknowledgment);
      
    } catch (error) {
      console.error(`❌ Error handling configuration for device ${deviceId}:`, error);
    }
  }

  publishMessage(deviceId, messageType, data) {
    if (!this.mqttClient || !this.mqttClient.connected) {
      console.error('❌ MQTT client not connected');
      return;
    }

    const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
    const topic = this.topics[messageType].replace('{modelSeries}', modelSeries).replace('{deviceId}', deviceId);
    const message = JSON.stringify(data);
    
    this.mqttClient.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish ${messageType} for ${deviceId}:`, err);
      } else {
        const counter = this.messageCounters.get(deviceId);
        if (counter) {
          counter[messageType]++;
        }
        console.log(`📤 Published ${messageType} for ${deviceId} (${modelSeries}) (${counter?.[messageType] || 0} total)`);
      }
    });
  }

  // Generate heartbeat message based on schema
  generateHeartbeat(deviceId) {
    const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
    
    return {
      timestamp: new Date(),
      deviceId: deviceId,
      modelSeries: modelSeries,
      device_status: ['online', 'online', 'online', 'maintenance'][Math.floor(Math.random() * 4)],
      network: {
        signal_strength: Math.floor(Math.random() * 40) - 100, // -60 to -100 dBm
        network_type: ['4G', 'WiFi', 'Ethernet'][Math.floor(Math.random() * 3)],
        mac_address: this.generateMacAddress(),
        ip_address: this.generateIPAddress()
      },
      firmware: {
        version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
      }
    };
  }

  // Generate telemetry message based on schema
  generateTelemetry(deviceId) {
    const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
    
    return {
      timestamp: new Date(),
      deviceId: deviceId,
      modelSeries: modelSeries,
      serial_no: `SN${deviceId}${Math.floor(Math.random() * 10000)}`,
      set_liters: (Math.floor(Math.random() * 20) + 1).toString(),
      remaining_litters: (Math.floor(Math.random() * 20) + 1).toString(),
      location_code: `LOC${Math.floor(Math.random() * 1000)}`
    };
  }

  // Generate error message based on schema
  generateError(deviceId) {
    const modelSeries = this.deviceModelMap.get(deviceId) || 'hexa_3000pro';
    const errorCodes = ['E001', 'E002', 'E003', 'E004', 'E005'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const messages = [
      'Water level sensor malfunction',
      'Payment system error',
      'Network connectivity issue',
      'Temperature sensor reading out of range',
      'Maintenance required'
    ];

    return {
      timestamp: new Date(),
      deviceId: deviceId,
      modelSeries: modelSeries,
      error_code: errorCodes[Math.floor(Math.random() * errorCodes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    };
  }

  generateMacAddress() {
    return Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':');
  }

  generateIPAddress() {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  startSimulation() {
    if (this.simulationActive) {
      console.log('⚠️  Simulation is already running');
      return;
    }

    console.log('🎬 Starting device simulation...');
    this.simulationActive = true;

    this.devices.forEach(deviceId => {
      // Initialize message counters
      this.messageCounters.set(deviceId, {
        heartbeat: 0,
        telemetry: 0,
        error: 0,
        acknowledgment: 0
      });
      
      // Heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        if (this.simulationActive) {
          const heartbeat = this.generateHeartbeat(deviceId);
          this.publishMessage(deviceId, 'heartbeat', heartbeat);
        }
      }, 30000);

      // Telemetry every 2 minutes
      const telemetryInterval = setInterval(() => {
        if (this.simulationActive) {
          const telemetry = this.generateTelemetry(deviceId);
          this.publishMessage(deviceId, 'telemetry', telemetry);
        }
      }, 120000);

      // Random errors (5% chance every 5 minutes)
      const errorInterval = setInterval(() => {
        if (this.simulationActive && Math.random() < 0.05) {
          const error = this.generateError(deviceId);
          this.publishMessage(deviceId, 'error', error);
        }
      }, 300000);

      this.intervals.set(deviceId, {
        heartbeat: heartbeatInterval,
        telemetry: telemetryInterval,
        error: errorInterval
      });
    });

    console.log(`✅ Simulation started for ${this.devices.length} devices`);
    console.log('📊 Message intervals:');
    console.log('   - Heartbeat: every 30 seconds');
    console.log('   - Telemetry: every 2 minutes');
    console.log('   - Errors: 5% chance every 5 minutes');
  }

  stopSimulation() {
    if (!this.simulationActive) {
      console.log('⚠️  Simulation is not running');
      return;
    }

    console.log('⏹️  Stopping device simulation...');
    this.simulationActive = false;

    this.intervals.forEach((intervals, deviceId) => {
      Object.values(intervals).forEach(interval => {
        clearInterval(interval);
      });
    });

    this.intervals.clear();
    console.log('✅ Simulation stopped');
  }

  getStatus() {
    const status = {
      simulationActive: this.simulationActive,
      devicesCount: this.devices.length,
      mqttConnected: this.mqttClient ? this.mqttClient.connected : false,
      messageCounters: Object.fromEntries(this.messageCounters),
      devices: this.devices
    };

    return status;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🛑 Shutting down device simulator...');
    
    this.stopSimulation();
    
    if (this.mqttClient) {
      this.mqttClient.end();
    }
    
    console.log('✅ Shutdown complete');
  }
}

// CLI Interface
class SimulatorCLI {
  constructor() {
    this.simulator = new DeviceSimulator();
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT. Graceful shutdown...');
      await this.simulator.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
      await this.simulator.shutdown();
      process.exit(0);
    });
  }

  async start() {
    try {
      await this.simulator.initialize();
      
      // Start simulation automatically
      this.simulator.startSimulation();
      
      // Display status every 30 seconds
      setInterval(() => {
        const status = this.simulator.getStatus();
        console.log('\n📊 Simulation Status:');
        console.log(`   Active: ${status.simulationActive}`);
        console.log(`   Devices: ${status.devicesCount}`);
        console.log(`   MQTT: ${status.mqttConnected ? 'Connected' : 'Disconnected'}`);
        console.log('   Message Counts:');
        Object.entries(status.messageCounters).forEach(([deviceId, counts]) => {
          console.log(`     ${deviceId}: H:${counts.heartbeat} T:${counts.telemetry} E:${counts.error} A:${counts.acknowledgment}`);
        });
      }, 30000);
      
    } catch (error) {
      console.error('❌ Failed to start simulator:', error);
      process.exit(1);
    }
  }
}

// Start the simulator if this file is run directly
if (require.main === module) {
  const cli = new SimulatorCLI();
  cli.start();
}

module.exports = { DeviceSimulator, SimulatorCLI };