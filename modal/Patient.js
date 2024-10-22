const mongoose = require("mongoose");
const IoTDevice = require("./IoTDevice");

// Patient Schema
const PatientSchema = new mongoose.Schema({
    id: { type: String, required: true },
    age: { type: Number, required: true },
    readings: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'IoTDevice',
    }] // Array of Reading objects
});


const Patient = mongoose.model("Patient", PatientSchema);

module.exports=Patient;