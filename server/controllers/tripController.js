const Trip = require("../models/Trip");
exports.createTrip = async(req,res)=>{
    const {destination,date,budget,description} = req.body;
    const trip = new Trip({
        destination,
        date,
        budget,
        description,
        createdBy: req.user.id
    });
    await trip.save();
    res.status(201).json(trip);
};
exports.getTrips = async(req,res)=>{
    const trips = await Trip.find({createdBy: req.user.id});
    res.json(trips);
};
exports.joinTrip = async(req,res)=>{
    const trip = await Trip.findById(req.params.id);
    if(!trip){
        return res.status(404).json("Trip not found");
    }
    if(trip.members.includes(req.user.id)){
        return res.status(400).json("Already joined");
    }
    trip.members.push(req.user.id);
    await trip.save();
    res.json(trip);
};