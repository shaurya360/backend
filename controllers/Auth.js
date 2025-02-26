const User = require("../models/userModel")
const cloudinary = require("cloudinary")
const generateToken = require("../config/generateToken")

async function uploadtoCloudinary(file, folder) {
    const { options } = folder
    return await cloudinary.uploader.upload(file.tempFilePath, options)
}

exports.Register = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        const response = req.files ? await uploadtoCloudinary(req.files.file, "Chatapp") : null;

        console.log(response)

        if (!name || !password || !email) {
            return res.json({
                success: false,
                message: "Please fill in all details"
            });
        }

        const findUser = await User.findOne({ email });
        const findUsername = await User.findOne({ name });

        if (findUser || findUsername) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        } else {
            const data = await User.create({
                name,
                email,
                password,
                imageUrl: response ? response.secure_url : null
            });
            return res.json({
                success: true,
                message: "User registered successfully",
                data: data
            });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "User registration failed"
        });
    }
}

exports.Login = async (req, res) => {
    try {
        const { name, password } = req.body;
        const findUser = await User.findOne({ name });

        if (findUser && findUser.password === password) {
            const token = generateToken(findUser._id);
            
            
            res.cookie("authToken", token, {
                httpOnly: true, 
                maxAge: 24 * 60 * 60 * 1000, 
            });

            return res.json({
                success: true,
                _id: findUser._id,
                name: findUser.name,
                imageUrl: findUser.imageUrl,
                email: findUser.email,
                isAdmin: findUser.isAdmin,
            });
        } else {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: err.message
        });
    }
}
