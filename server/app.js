require("dotenv").config({ path: require("path").join(__dirname, ".env") })

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")

const http = require("http")
const {Server} = require("socket.io")
const jwt = require("jsonwebtoken")

const connectDB = require("./config/Database")
const Message = require("./models/Message")
const Trip = require("./models/Trip")
const User = require("./models/User")

const authRoutes = require("./routes/authRoutes")
const tripRoutes = require("./routes/tripRoutes")
const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const feedRoutes = require("./routes/feedRoutes")
const aiRoutes = require("./routes/aiRoutes")
const messageRoutes = require("./routes/messageRoutes")
const { notFound, errorHandler } = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || "*"

connectDB()

app.use(cors({
 origin: CLIENT_URL,
 credentials: true
}))
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.get("/api/health", (req, res) => {
 res.json({
  status: "ok",
  message: "Travel Together API is running"
 })
})

app.use("/api/auth",authRoutes)
app.use("/api/trips",tripRoutes)
app.use("/api/users",userRoutes)
app.use("/api/reviews",reviewRoutes)
app.use("/api/feed",feedRoutes)
app.use("/api/ai",aiRoutes)
app.use("/api/messages",messageRoutes)

app.use(notFound)
app.use(errorHandler)

const server = http.createServer(app)

const io = new Server(server,{
 cors: {
  origin: CLIENT_URL
 }
})

io.use(async (socket, next) => {
 try {
  const token = socket.handshake.auth && socket.handshake.auth.token

  if (!token) {
   return next(new Error("Unauthorized"))
  }

  if (!process.env.JWT_SECRET) {
   return next(new Error("JWT secret not configured"))
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decoded.id).select("name")

  if (!user) {
   return next(new Error("Unauthorized"))
  }

  socket.userId = String(user._id)
  socket.userName = user.name
  next()
 } catch (error) {
  next(new Error("Unauthorized"))
 }
})

io.on("connection",(socket)=>{

socket.on("joinTrip", async (tripId) => {
 try {
  if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
   socket.emit("chatError", {
    message: "Invalid trip id"
   })
   return
  }

  const trip = await Trip.findOne({
   _id: tripId,
   members: socket.userId
  }).select("_id")

  if (!trip) {
   socket.emit("chatError", {
    message: "Join the trip first to access chat"
   })
   return
  }

  socket.join(String(trip._id))
 } catch (error) {
  socket.emit("chatError", {
   message: "Failed to join chat room"
  })
 }
})

socket.on("sendMessage", async (data) => {
 try {
  if(!data || !data.tripId || !data.message){
   return
  }

  if (!mongoose.Types.ObjectId.isValid(data.tripId)) {
   socket.emit("chatError", {
    message: "Invalid trip id"
   })
   return
  }

  const text = String(data.message).trim()

  if (!text) {
   return
  }

  const trip = await Trip.findOne({
   _id: data.tripId,
   members: socket.userId
  }).select("_id")

  if (!trip) {
   socket.emit("chatError", {
    message: "Join the trip first to send messages"
   })
   return
  }

  const messageDoc = await Message.create({
   tripId: data.tripId,
   senderId: socket.userId,
   text
  })

  const payload = {
   _id: String(messageDoc._id),
   tripId: String(messageDoc.tripId),
   senderId: String(messageDoc.senderId),
   senderName: socket.userName,
   text,
   createdAt: messageDoc.createdAt
  }

  io.to(String(trip._id)).emit("receiveMessage", payload)
 } catch (error) {
  socket.emit("chatError", {
   message: "Failed to send message"
  })
 }

})

socket.on("getTripMemberCounts", async (tripId) => {
 try {
  if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
   socket.emit("tripMemberCountsError", {
    message: "Invalid trip id"
   })
   return
  }

  const trip = await Trip.findById(tripId)
   .select("members joinedUsers")
   .populate("joinedUsers", "name")
   .populate("members", "name")

  if (!trip) {
   socket.emit("tripMemberCountsError", {
    message: "Trip not found"
   })
   return
  }

  const joinedUsers = Array.isArray(trip.joinedUsers) && trip.joinedUsers.length > 0
   ? trip.joinedUsers
   : trip.members

  const safeJoinedUsers = Array.isArray(joinedUsers) ? joinedUsers : []

  socket.emit("tripMemberCounts", {
   tripId: String(trip._id),
   joinedUsers: safeJoinedUsers,
   joinedCount: safeJoinedUsers.length
  })
 } catch (error) {
  socket.emit("tripMemberCountsError", {
   message: "Failed to fetch trip member counts"
  })
 }
})

})

server.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`)
})