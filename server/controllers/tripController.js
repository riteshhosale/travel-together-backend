const Trip = require("../models/Trip");

const buildJoinedUsers = (trip)=>{
 const joinedUsers = Array.isArray(trip.joinedUsers) && trip.joinedUsers.length > 0
  ? trip.joinedUsers
  : trip.members;

 return Array.isArray(joinedUsers) ? joinedUsers : [];
};

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
   members:[req.user.id],
   joinedUsers:[req.user.id]
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
   .populate("joinedUsers", "name")
   .sort({ createdAt: -1 });

  const payload = trips.map((trip)=>{
   const joinedUsers = buildJoinedUsers(trip);

   return {
    ...trip.toObject(),
    joinedUsers,
    joinedCount: joinedUsers.length
   };
  });

  res.json(payload);

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

  const trip = await Trip.findById(req.params.id)
   .populate("members", "name")
   .populate("joinedUsers", "name");

  if(!trip){
   return res.status(404).json({
    message: "Trip not found"
   });
  }

  const hasJoined = (Array.isArray(trip.joinedUsers) && trip.joinedUsers.some((member)=>member.toString() === req.user.id))
   || (Array.isArray(trip.members) && trip.members.some((member)=>member.toString() === req.user.id));

  if(hasJoined){
   const joinedUsers = buildJoinedUsers(trip);

   return res.json({
    message: "Already joined",
    joinedUsers,
    joinedCount: joinedUsers.length
   });
  }

  if(!Array.isArray(trip.members)){
   trip.members = [];
  }

  if(!Array.isArray(trip.joinedUsers)){
   trip.joinedUsers = [];
  }

  trip.members.push(req.user.id);
  trip.joinedUsers.push(req.user.id);

  await trip.save();

  const joinedUsers = buildJoinedUsers(trip);

  res.json({
   message: "Joined trip",
   joinedUsers,
   joinedCount: joinedUsers.length
  });

 }catch(error){
  res.status(500).json({
   message: "Failed to join trip"
  });
 }

};

exports.getTripById = async(req,res)=>{

 try{
  const trip = await Trip.findById(req.params.id)
   .populate("createdBy", "name location")
   .populate("members", "name")
   .populate("joinedUsers", "name");

  if(!trip){
   return res.status(404).json({
    message: "Trip not found"
   });
  }

  const joinedUsers = buildJoinedUsers(trip);

  res.json({
   ...trip.toObject(),
   joinedUsers,
   joinedCount: joinedUsers.length
  });

 }catch(error){
  res.status(500).json({
   message: "Failed to fetch trip"
  });
 }

};