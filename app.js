const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hexagon-simulator');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// MQTT Connection
const connectMQTT = () => {
  const mqttOptions = {
    host: process.env.MQTT_HOST || 'localhost',
    port: process.env.MQTT_PORT || 1883,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: process.env.MQTT_CLIENT_ID || `hexagon-simulator-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  const client = mqtt.connect(mqttOptions);

  client.on('connect', () => {
    console.log('MQTT Client Connected');
    
    // Subscribe to topics (will be configured later)
    const topics = [
      'hexagon/+/status',
      'hexagon/+/events',
      'hexagon/+/telemetry'
    ];
    
    topics.forEach(topic => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });
  });

  client.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
  });

  client.on('reconnect', () => {
    console.log('MQTT Client Reconnecting...');
  });

  client.on('message', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received message on ${topic}:`, data);
      
      // Process incoming messages (will be implemented later)
      handleIncomingMessage(topic, data);
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  });

  return client;
};

// Handle incoming MQTT messages
const handleIncomingMessage = (topic, data) => {
  // This function will be expanded based on the specific topics and data structure
  console.log(`Processing message from ${topic}:`, data);
  
  // Extract device ID from topic (assuming format: hexagon/{deviceId}/{type})
  const topicParts = topic.split('/');
  if (topicParts.length >= 2) {
    const deviceId = topicParts[1];
    const messageType = topicParts[2];
    
    console.log(`Device: ${deviceId}, Type: ${messageType}`);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hexagon MQTT Simulator Microservice',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mqtt: mqttClient ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global variables
let mqttClient;

// Initialize connections and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to MQTT
    mqttClient = connectMQTT();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Hexagon MQTT Simulator running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Graceful shutdown...');
  
  if (mqttClient) {
    mqttClient.end();
  }
  
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  
  if (mqttClient) {
    mqttClient.end();
  }
  
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Start the server
startServer();
