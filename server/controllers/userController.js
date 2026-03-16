const User = require("../models/User")
const bcrypt = require("bcryptjs")

exports.getProfile = async (req, res) => {
 try {
  const userId = req.user && (req.user.id || req.user._id)

  if (!userId) {
   return res.status(401).json({
    message: "Unauthorized"
   })
  }

  const user = await User.findById(userId).select("-password")

  if (!user) {
   return res.status(404).json({
    message: "User not found"
   })
  }

  res.json(user)
 } catch (error) {
  res.status(500).json({
   message: "Failed to load profile"
  })
 }
}

exports.updateProfile = async (req, res) => {
 try {
  const userId = req.user && (req.user.id || req.user._id)

  if (!userId) {
   return res.status(401).json({
    message: "Unauthorized"
   })
  }

  const { name, email, password, location } = req.body

  const user = await User.findById(userId)

  if (!user) {
   return res.status(404).json({
    message: "User not found"
   })
  }

  if (email && email !== user.email) {
   const existingUser = await User.findOne({ email: email.toLowerCase().trim() })

   if (existingUser) {
    return res.status(400).json({
     message: "Email already exists"
    })
   }

   user.email = email.toLowerCase().trim()
  }

  if (name !== undefined) {
   user.name = String(name).trim()
  }

  if (location !== undefined) {
   user.location = String(location).trim()
  }

  if (password) {
   if (String(password).length < 6) {
    return res.status(400).json({
     message: "Password must be at least 6 characters"
    })
   }

   user.password = await bcrypt.hash(String(password), 10)
  }

  await user.save()

  const updatedUser = user.toObject()
  delete updatedUser.password

  res.json(updatedUser)
 } catch (error) {
  res.status(500).json({
   message: "Failed to update profile"
  })
 }
}
