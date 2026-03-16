const mongoose = require("mongoose")

const feedSchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

image:String,

caption:String,

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("Feed",feedSchema)