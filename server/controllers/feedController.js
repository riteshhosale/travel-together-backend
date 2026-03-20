const Feed = require("../models/Feed")

const getBaseUrl = (req) => {
  if (process.env.BACKEND_BASE_URL) {
    return String(process.env.BACKEND_BASE_URL).replace(/\/+$/, "")
  }

  const forwardedProto = req.headers["x-forwarded-proto"]
  const forwardedHost = req.headers["x-forwarded-host"]
  const protocol = forwardedProto || req.protocol || "http"
  const host = forwardedHost || req.get("host")

  return `${protocol}://${host}`
}

exports.createPost = async(req,res)=>{

try{

const { image, caption } = req.body
const backendBaseUrl = getBaseUrl(req)

const uploadedImage = req.file
 ? `${backendBaseUrl}/uploads/${req.file.filename}`
 : ""

const imageValue = uploadedImage || (image ? String(image).trim() : "")

if(!req.user || !req.user.id){
 return res.status(401).json({
  message: "Unauthorized"
 })
}

if(!imageValue && !caption){
 return res.status(400).json({
  message: "Either image or caption is required"
 })
}

const post = new Feed({

user:req.user.id,
image:imageValue,
caption:caption ? String(caption).trim() : ""

})

await post.save()

await post.populate("user","name")

res.json(post)

}catch(error){
res.status(500).json({
 message: "Failed to create post"
})
}

}

exports.getFeed = async(req,res)=>{

try{

const posts = await Feed.find()
 .populate("user","name")
 .sort({createdAt:-1})

res.json(posts)

}catch(error){
res.status(500).json({
 message: "Failed to fetch feed"
})
}

}