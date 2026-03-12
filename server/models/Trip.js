const mongoose = require("mongoose");
const tripSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    budget: Number,

    description: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

module.exports = mongoose.model("Trip", tripSchema);