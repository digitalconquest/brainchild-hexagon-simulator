const fs = require('fs');

class DeviceLoader {
  constructor() {
    this.machines = [];
    this.machineModels = [];
    this.deviceModelMap = new Map();
  }

  loadData() {
    try {
      // Load machine models
      const machineModelsData = fs.readFileSync('./hexagon_smart.machinemodels.json', 'utf8');
      this.machineModels = JSON.parse(machineModelsData);
      console.log(`📋 Loaded ${this.machineModels.length} machine models`);

      // Load machines
      const machinesData = fs.readFileSync('./hexagon_smart.machines.json', 'utf8');
      this.machines = JSON.parse(machinesData);
      console.log(`📱 Loaded ${this.machines.length} machines`);

      // Create mapping from model ObjectId to modelSeries
      const modelMap = new Map();
      this.machineModels.forEach(model => {
        modelMap.set(model._id.$oid, model.alias);
      });

      // Map each device to its modelSeries
      this.machines.forEach(machine => {
        const modelId = machine.model.$oid;
        const modelSeries = modelMap.get(modelId);
        if (modelSeries) {
          this.deviceModelMap.set(machine.deviceId, modelSeries);
          console.log(`🔗 Mapped device ${machine.deviceId} to model ${modelSeries}`);
        } else {
          console.warn(`⚠️  No model found for device ${machine.deviceId} with model ID ${modelId}`);
        }
      });

      console.log(`✅ Successfully mapped ${this.deviceModelMap.size} devices to their models`);
      return {
        devices: this.machines.map(m => m.deviceId),
        deviceModelMap: this.deviceModelMap,
        machineModels: this.machineModels
      };

    } catch (error) {
      console.error('❌ Error loading device data:', error);
      throw error;
    }
  }

  getDeviceModelSeries(deviceId) {
    return this.deviceModelMap.get(deviceId) || 'hexa_3000pro'; // fallback
  }

  getActiveDevices() {
    return this.machines.filter(machine => machine.active).map(machine => machine.deviceId);
  }

  getDeviceInfo(deviceId) {
    const machine = this.machines.find(m => m.deviceId === deviceId);
    const modelSeries = this.getDeviceModelSeries(deviceId);
    const model = this.machineModels.find(m => m.alias === modelSeries);
    
    return {
      deviceId,
      modelSeries,
      model: model || null,
      active: machine ? machine.active : false
    };
  }
}

module.exports = DeviceLoader;
