const Chat = require("../models/chatModel")
const User = require("../models/userModel")
const cloudinary = require("cloudinary")

async function uploadtoCloudinary(file,folder){
  const {options} = folder
  return await cloudinary.uploader.upload(file.tempFilePath,options)
}

exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const id = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found"
      });
    }

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ]
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email"
    });

    if (isChat.length > 0) {
      return res.json(isChat[0]);
    } else {

      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [id, userId]
      };

      try {
        const createChat = await Chat.create(chatData)
  
        const populatedChat = await Chat.findById(createChat._id).populate("users", "-password");
      

        return res.json(populatedChat);
      } catch (err) {
        console.error("Error creating chat:", err);
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  } catch (err) {
    console.error("Error accessing chat:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.fetchChats = async(req,res)=>{
    try{

      const data = await Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
      .populate("users","-password")
      .populate("groupAdmin","-password")
      .populate("latestMessage")
      .sort({updatedAt:-1})
      .then(async(results)=>{
        results = await User.populate(results,{
            path:"latestMessage.sender",
            select:"name email"
        })
        res.json(results)
      })
      
    }
    catch(err){
        console.log(err);
        return res.json({
            success:false
        })
    }
}
exports.createGroup = async(req,res)=>{
  try{
    if(!req.body.users||!req.body.name){
      console.log(req.body.users) 
      console.log(req.body.name) 
      return res.json({message:"insufficient data"})
    }
    const response = req.files ? await uploadtoCloudinary(req.files.file,"Chatapp") : null
    var users = req.body.users;
    if(users.length<2){
      return res.json({message:"more than 2 are required"})
    }
    users.push(req.user._id);
    const groupChat = await Chat.create({
      chatName:req.body.name,
      users:users,
      isGroupChat:true,
      groupAdmin:req.user._id,
      GroupchatPhoto:response===null?(null):response.secure_url
    })
    const fullGroupChat = await Chat.findOne({_id:groupChat._id})
    .populate("users","-password")
    .populate("groupAdmin","-password")
    return res.status(200).json(fullGroupChat)
  }
  catch(err){
    console.log(err)
    return res.json({success:false})
  }
}