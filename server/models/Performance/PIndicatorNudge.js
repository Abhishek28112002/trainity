const mongoose = require("mongoose");

const PNudgeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        index: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    });

mongoose.model("pIndicatorNudge", PNudgeSchema);