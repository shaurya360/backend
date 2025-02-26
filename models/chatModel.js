const mongoose = require("mongoose")

const chatModel = new mongoose.Schema({
    chatName:{
        type:String,
    },
    isGroupChat:{type:Boolean},
    GroupchatPhoto:{type:String,default:null},
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timeStamp:true
}
)
module.exports = mongoose.model("Chat",chatModel)
