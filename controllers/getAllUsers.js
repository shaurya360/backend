const User = require("../models/userModel")
const Chat = require("../models/chatModel")
const { json } = require("express")

exports.getAllUser = async(req,res)=>{
    try{
     const id = req.user._id
     console.log(id)

     const users = await User.find({
        _id:{$ne:id} 
     })
     
     res.json((users))
    }
    catch(err){
        console.log(err);
        return res.json({
            success:false,
            message:"users not found"
        })
    }
}

exports.findUser = async(req,res)=>{
    try{
       const name = req.body.name
       ?{
        $or:[
            {name:{$regex:req.body.name,$options:"i"}},
            {email:{$regex:req.body.name,$options:"i"}},
        ]
       }:{} 
       const users = await User.find(name).find({_id:{$ne:req.user._id}})
       res.send(users)
    }
    catch(err){

    }
}

exports.isGroupChat = async(req,res)=>{
  try{
    const {chatId} = await req.body;
    console.log(chatId)
    if(!chatId){
      return res.json("chatId missing")
    }
    const chat = await Chat.findById(chatId).populate("users","-password");

    if(chat.isGroupChat){
      return res.json(true)
    }
    else{
      return res.json(false)
    }
  }
  catch(err){
    console.log(err)
    return res.json(err.message)
  }
}

exports.getGroupDetails = async(req,res)=>{
  try{
    const {chatId} = await req.body

    if (!chatId ) {
      return res.status(400).json("Chat ID is missing");
    }

    const chat = await Chat.findById(chatId).populate("users","-password")

    return res.json(chat)

  }
  catch(err){
    console.log(err)
    return res.json(err.message)
  }
}

exports.getUserById = async (req, res) => {
    try {
      const userId = req.user._id.toString();;
     
      const { chatId } = await req.body; 
      if (!chatId || !userId) {
        return res.status(400).json("Chat ID or User ID is missing");
      }
  
      // Fetch the chat document and populate the users field
      const chat = await Chat.findById(chatId).populate("users", "-password"); 
      if (!chat) {
        return res.status(404).json("Chat not found");
      }
  
      // Ensure the chat has users
      if (!chat.users || !Array.isArray(chat.users)) {
        return res.status(404).json("Users not found in the chat");
      }
  
      // Find the other user in the chat
      const otherUser = chat.users.find((user) => user._id.toString() !== userId);

      
      if (!otherUser) {
        return res.status(404).json("Other user not found in the chat");
      }
  
      return res.status(200).json(otherUser); // Return the other user's data

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  };
  
  exports.getMyDetails = async(req,res)=>{
    try{
        const id = req.user._id;
        if (!id) {
            return res.status(400).json("User ID is missing");
        }
        const user = await User.findOne({_id:id});
        if(!user){
            return res.status(400).json("No user found");
        }
        return res.json(user)
    }
    catch(err){
        console.log(err)
        return res.json(err.message)
    }
  }