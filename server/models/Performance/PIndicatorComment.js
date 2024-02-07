const mongoose = require("mongoose");

const PIndicatorCommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    employeeId: {
        type: String,
        index: true,
        required: true,
    },
    managerInfo: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    });

mongoose.model("pIndicatorComment", PIndicatorCommentSchema);