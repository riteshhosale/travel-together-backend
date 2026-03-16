const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({

tripId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Trip"
},

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

rating:Number,

comment:String

}, { timestamps: true })

module.exports = mongoose.model("Review",reviewSchema)