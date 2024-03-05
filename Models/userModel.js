const mongoose=require("mongoose");

const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        maxlength:50
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:/^\S+@\S+\.\S+$/
    },
    password:{
        type:String,
        required:true,
        // unique:true,
        // minlength:6,
        // maxlength:50
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

const User=mongoose.model("User", userSchema);

module.exports=User;