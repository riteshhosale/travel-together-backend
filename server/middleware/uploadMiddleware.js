const fs = require("fs")
const path = require("path")
const multer = require("multer")

const uploadsDir = path.join(__dirname, "..", "uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase()
    const safeExt = ext || ".jpg"
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"), false)
    return
  }

  cb(null, true)
}

const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

module.exports = {
  uploadImage,
}
