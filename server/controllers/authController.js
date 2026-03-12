const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async(req,res)=>{
    const {name,email,password,location} = req.body;
    const userExists = await User.findone({email});

    if(userExists){
        return res.status(400).json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const user = new User({
        name,
        email,
        password:hashedPassword,
        location
    });
    await user.save();
    res.json("User registered");
};

exports.loginUser = async(res,req)=>{
    const {email,password} =req.body;
    const user = await User.findone({email});

    if(!user){
        return res.status(400).json("Inalid password");
    }
    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET
    );
    res.json({token});
};
