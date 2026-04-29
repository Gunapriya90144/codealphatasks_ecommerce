const express = require("express")
const http = require("http")
const socket = require("socket.io")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const { v4: uuidv4 } = require("uuid")

const User = require("./models/User")

const app = express()
const server = http.createServer(app)
const io = socket(server)

app.use(express.json())
app.use(express.static("public"))

mongoose.connect("mongodb://127.0.0.1:27017/videomeet")
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err))

// File Upload Setup
const storage = multer.diskStorage({
destination: "uploads",
filename: (req, file, cb) => {
cb(null, Date.now() + "-" + file.originalname)
}
})

const upload = multer({ storage })

// Register API
app.post("/register", async (req, res) => {

const { name, email, password } = req.body

const hash = await bcrypt.hash(password, 10)

await User.create({
name,
email,
password: hash
})

res.json({ message: "registered" })

})

// Login API
app.post("/login", async (req, res) => {

const { email, password } = req.body

const user = await User.findOne({ email })

if (!user) return res.json({ error: "user not found" })

const match = await bcrypt.compare(password, user.password)

if (!match) return res.json({ error: "wrong password" })

res.json({ message: "success" })

})

// Create Meeting Room
app.get("/create-room", (req, res) => {
res.json({ room: uuidv4() })
})

// File Upload
app.post("/upload", upload.single("file"), (req, res) => {
res.json({ file: req.file.filename })
})

// Socket.IO Real-time Communication
io.on("connection", (socket) => {

console.log("User connected")

socket.on("join-room", (room, user) => {

socket.join(room)

socket.to(room).emit("user-connected", user)

socket.on("chat-message", (msg) => {
io.to(room).emit("chat-message", msg)
})

socket.on("drawing", (data) => {
socket.to(room).emit("drawing", data)
})

socket.on("disconnect", () => {
socket.to(room).emit("user-disconnected", user)
})

})

})

// Start Server
server.listen(3000, () => {
console.log("Server running on http://localhost:3000")
})