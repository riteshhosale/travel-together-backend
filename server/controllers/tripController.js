const Trip = require("../models/Trip");

exports.createTrip = async(req,res)=>{

 try{

  const {destination,date,budget,description} = req.body;

    if(!req.user || !req.user.id){
     return res.status(401).json({
      message: "Unauthorized"
     });
    }

    if(!destination || !date){
     return res.status(400).json({
      message: "Destination and date are required"
     });
    }

  const parsedBudget = budget !== undefined && budget !== null && budget !== ""
   ? Number(budget)
   : undefined;

  if(parsedBudget !== undefined && Number.isNaN(parsedBudget)){
   return res.status(400).json({
    message: "Budget must be a valid number"
   });
  }

  const trip = new Trip({
   destination: destination.trim(),
   date,
   budget: parsedBudget,
   description: description ? description.trim() : "",
   createdBy:req.user.id,
   members:[req.user.id]
  });

  await trip.save();

    res.status(201).json(trip);

 }catch(error){
  res.status(500).json({
   message: "Failed to create trip"
  });
 }

};

exports.getTrips = async(req,res)=>{

 try{

  const trips = await Trip.find()
   .populate("createdBy", "name location")
   .populate("members", "name")
   .sort({ createdAt: -1 });

  res.json(trips);

 }catch(error){
  res.status(500).json({
   message: "Failed to fetch trips"
  });
 }

};

exports.joinTrip = async(req,res)=>{

 try{

  if(!req.user || !req.user.id){
   return res.status(401).json({
    message: "Unauthorized"
   });
  }

  const trip = await Trip.findById(req.params.id);

  if(!trip){
   return res.status(404).json({
    message: "Trip not found"
   });
  }

    if(trip.members.some((member)=>member.toString() === req.user.id)){
   return res.json({
    message: "Already joined"
   });
  }

  trip.members.push(req.user.id);

  await trip.save();

  res.json({
   message: "Joined trip"
  });

 }catch(error){
  res.status(500).json({
   message: "Failed to join trip"
  });
 }

};