const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/userRoutes");
const fileupload = require("express-fileupload");
const translator  = require('open-google-translator');
const cron = require("node-cron");
const Message = require("./models/messageModel"); // Adjust the path as needed
const Chat = require("./models/chatModel"); 
const moment = require('moment'); 

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

const cloudinary = require("./config/cloudinary");
cloudinary.cloudinaryConnect();

require("dotenv").config();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};
connectDb();

app.use("/user", userRoutes);
app.get("/", (req, res) => {
    res.send("Server Running");
});

// Cron job to delete self-destructing messages
cron.schedule("* * * * *", async () => {
    const currentTime = moment().toISOString();

    try {
        // Find and delete expired messages
        const expiredMessages = await Message.deleteMany({
            expiresAt: { $lt: currentTime } // Delete messages where expiresAt is before the current time
        });

        console.log(`Deleted ${expiredMessages.deletedCount} expired messages.`);
    } catch (error) {
        console.log('Error deleting expired messages:', error);
    }
});  

app.post('/translate', (req, res) => {
    const { sentence, fromLanguage, toLanguage } = req.body;
  
    if (!sentence || !fromLanguage || !toLanguage) {
      return res.status(400).json({ error: 'sentence, fromLanguage, and toLanguage are required' });
    }
  
    // Use the TranslateLanguageData method to translate the single sentence
    translator
      .TranslateLanguageData({
        listOfWordsToTranslate: [sentence], // Wrap sentence in an array
        fromLanguage: fromLanguage,
        toLanguage: toLanguage
      })
      .then((data) => {
        // Respond with the translated sentence
        return res.json({ translatedData: data[0] });
      })
      .catch((error) => {
        console.error('Translation failed:', error);
        return res.status(500).json({ error: 'Translation failed' });
      });
  });

  
const server = app.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});


const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});



io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("setup", (user) => {
        socket.join(user);
        socket.emit("connected");
        console.log(`User ${user} joined room`);
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined chat room ${room}`);
    });

    socket.on("new user", () => {

    });

    socket.on("new message", (newMessageStatus, id) => {
        console.log(`New message from ${newMessageStatus.sender} in room ${id}`);
        socket.to(id).emit("message received", newMessageStatus);

        // socket.to(id).emit("new message", newMessageStatus);

    });

    socket.on("sidebar", () => {
        console.log("Sidebar update triggered by:", socket.id, "with data:");
        io.emit("sidebar")
    });

    socket.on("newuser", () => {
        console.log("new user")
        socket.emit("newuser")
    })


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

