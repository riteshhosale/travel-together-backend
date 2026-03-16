const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req,res)=>{

 try{

   const {name,email,password,location} = req.body;
   const normalizedEmail = email ? String(email).toLowerCase().trim() : "";

   if(!name || !email || !password){
     return res.status(400).json({
        message:"Name, email, and password are required"
     });
    }

   if(password.length < 6){
    return res.status(400).json({
      message:"Password must be at least 6 characters"
    });
   }

  const existingUser = await User.findOne({email: normalizedEmail});

  if(existingUser){
   return res.status(400).json({
    message:"Email already exists"
   });
  }

  const hashedPassword = await bcrypt.hash(password,10);

  const user = new User({
    name: String(name).trim(),
    email: normalizedEmail,
   password:hashedPassword,
    location: location ? String(location).trim() : ""
  });

  await user.save();

  res.status(201).json({
   message:"User registered successfully"
  });

 }catch(error){
  res.status(500).json({
   message:"Server error"
  });
 }

};

exports.loginUser = async (req,res)=>{

 try{

  const {email,password} = req.body;
  const normalizedEmail = email ? String(email).toLowerCase().trim() : "";

    if(!email || !password){
     return res.status(400).json({
        message:"Email and password are required"
     });
    }

  const user = await User.findOne({email: normalizedEmail});

  if(!user){
   return res.status(400).json({
    message:"Invalid credentials"
   });
  }

  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch){
   return res.status(400).json({
    message:"Invalid credentials"
   });
  }

   if(!process.env.JWT_SECRET){
    return res.status(500).json({
      message:"JWT secret not configured"
    });
   }

   const token = jwt.sign(
   {id:user._id},
   process.env.JWT_SECRET,
   {expiresIn:"7d"}
  );

  res.json({
   token,
   user:{
    id:user._id,
    name:user.name,
    email:user.email,
    location:user.location
   }
  });

 }catch(error){
  res.status(500).json({
   message:"Server error"
  });
 }

};

exports.logoutUser = async (req,res)=>{

 res.json({
  message:"Logged out"
 });

};