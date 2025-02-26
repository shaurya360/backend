const User = require("../models/userModel")
const Chat = require("../models/chatModel")
const Message = require("../models/messageModel")
const cloudinary = require("cloudinary")
const moment = require('moment'); // Moment.js for date manipulation

async function uploadtoCloudinary(file,folder){
    const {options} = folder
    return await cloudinary.uploader.upload(file.tempFilePath,options)
}

exports.allMessages = async(req,res)=>{
    try{
        const {chat} = req.body;
        const message = await Message.find({chat:chat})
        // .populate("name" ,"email")
        .populate("receiver")
        .populate("chat")
        res.json(message);
    }
    catch(err){
        console.log(err);
        return res.json({
            success:false
        })
    }
}



exports.sendMessage = async (req, res) => {
    try {
        const { content, chatId, expiresIn } = req.body;
        console.log(expiresIn)
        // Calculate expiration time only if expiresIn is provided
        const expiresAt = expiresIn && !isNaN(expiresIn)
            ? moment().add(expiresIn, 'seconds').toISOString()
            : null;

        const response = req.files ? await uploadtoCloudinary(req.files.file, "Chatapp") : null;

        const newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId,
            image: response ? response.secure_url : null,
            expiresAt: expiresAt  // Only include if calculated
        };

        try {
            let message = await Message.create(newMessage);
            message = await User.populate(message, {
                path: "chat.users",
                select: "name email"
            });

            const data = await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

            res.json(message);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Message creation failed' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
