exports.tripPlan = (req,res)=>{

try{

const destination = req.body && req.body.destination

if(!destination){
 return res.status(400).json({
  message: "Destination is required"
 })
}

res.json({

destination:String(destination).trim(),

days:3,

activities:[
"city tour",
"local food",
"nature exploration"
]

})

}catch(error){
res.status(500).json({
 message: "Failed to generate trip plan"
})
}

}

exports.luggage = (req,res)=>{

try{

const destination = req.body && req.body.destination

if(!destination){
 return res.status(400).json({
  message: "Destination is required"
 })
}

res.json({

items:[
"passport",
"phone charger",
"camera",
"powerbank",
"extra clothes"
]

})

}catch(error){
res.status(500).json({
 message: "Failed to generate luggage checklist"
})
}

}