const mongoose = require("mongoose")

const userModel = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String
    }
},
{
    timeStamp:true
}
)
module.exports =mongoose.model("User",userModel)