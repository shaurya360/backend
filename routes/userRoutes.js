const express = require("express")
const router = express.Router()

const{Register,Login} = require("../controllers/Auth")
const{getAllUser,findUser,getUserById,getMyDetails,getGroupDetails,isGroupChat} = require("../controllers/getAllUsers")
const{protectRoute} = require("../middlewares/protectRoute")
const {sendMessage,allMessages} = require("../controllers/Message")
const {fetchChats,accessChat,createGroup} = require("../controllers/chat")


router.post("/signup",Register)
router.post("/login",Login)
router.post("/getall",protectRoute,getAllUser)
router.post("/finduser",protectRoute,findUser)
router.post("/getuser",protectRoute,getUserById)
router.post("/getmydetails",protectRoute,getMyDetails)
router.post("/getgroupdetails",protectRoute,getGroupDetails)
router.post("/isgroupchat",protectRoute,isGroupChat)

router.post("/sendmessage",protectRoute,sendMessage)
router.post("/allmessage",protectRoute,allMessages)

router.post("/fetchchats",protectRoute,fetchChats)
router.post("/fetchchat",protectRoute)
router.post("/accesschats",protectRoute,accessChat)
router.post("/creategroup",protectRoute,createGroup)

module.exports = router