const mongoose = require("mongoose");

const IoTDeviceSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Optionally make this required
    reading: { type: String, required: true }, // Optionally make this required
 // Use Date type with a default value
},{timestamp:true}
);

const IoTDevice = mongoose.model("IoTDevice", IoTDeviceSchema); // Capitalized model name

module.exports = IoTDevice;
