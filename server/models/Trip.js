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
 }],

 joinedUsers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
 }]

}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

tripSchema.virtual("joinedCount").get(function() {
 const joinedUsers = Array.isArray(this.joinedUsers) && this.joinedUsers.length > 0
  ? this.joinedUsers
  : this.members;

 return Array.isArray(joinedUsers) ? joinedUsers.length : 0;
});

module.exports = mongoose.model("Trip", tripSchema);